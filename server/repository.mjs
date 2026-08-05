import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicId, sha256, token } from './utils.mjs';
import { overlaps } from './availability.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bookingsFile = path.join(root, 'data', 'bookings.json');
const settingsFile = path.join(root, 'data', 'settings.json');
const stripeEventsFile = path.join(root, 'data', 'stripe-events.json');
let queue = Promise.resolve();
let sqlClientPromise;

function normalizeBooking(row) {
  if (!row) return null;
  return {
    ...row,
    publicId: row.publicId ?? row.public_id,
    serviceName: row.serviceName ?? row.service_name,
    customerName: row.customerName ?? row.customer_name,
    customerEmail: row.customerEmail ?? row.customer_email,
    customerPhone: row.customerPhone ?? row.customer_phone,
    customerNote: row.customerNote ?? row.customer_note,
    styleId: row.styleId ?? row.style_id,
    styleTitle: row.styleTitle ?? row.style_title,
    startsAt: row.startsAt ?? row.starts_at,
    endsAt: row.endsAt ?? row.ends_at,
    holdExpiresAt: row.holdExpiresAt ?? row.hold_expires_at,
    stripeCheckoutSessionId: row.stripeCheckoutSessionId ?? row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripePaymentIntentId ?? row.stripe_payment_intent_id,
    amountPaidCents: row.amountPaidCents ?? row.amount_paid_cents,
    manageTokenHash: row.manageTokenHash ?? row.manage_token_hash,
    cancelReason: row.cancelReason ?? row.cancel_reason,
    cancelledAt: row.cancelledAt ?? row.cancelled_at,
    confirmedAt: row.confirmedAt ?? row.confirmed_at,
    completedAt: row.completedAt ?? row.completed_at,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at
  };
}

function useDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function db() {
  if (!useDatabase()) return null;
  if (!sqlClientPromise) {
    sqlClientPromise = import('@neondatabase/serverless').then(({ neon }) => neon(process.env.DATABASE_URL));
  }
  return sqlClientPromise;
}

async function localRead(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return fallback; }
}

async function localWrite(file, value) {
  await fs.writeFile(file, JSON.stringify(value, null, 2));
}

async function expireOldHolds() {
  if (!useDatabase()) return;
  await (await db())`
    update public.bookings
       set status = 'EXPIRED', updated_at = now()
     where status = 'PENDING_PAYMENT'
       and hold_expires_at is not null
       and hold_expires_at <= now()
  `;
}

export async function getSettings() {
  if (useDatabase()) {
    const rows = await (await db())`select value_json from public.settings where key = 'app' limit 1`;
    if (rows?.[0]?.value_json) return rows[0].value_json;
  }
  return localRead(settingsFile, {});
}

export async function updateSettings(settings) {
  if (useDatabase()) {
    const rows = await (await db())`
      insert into public.settings(key, value_json, updated_at)
      values ('app', ${JSON.stringify(settings)}::jsonb, now())
      on conflict (key) do update
        set value_json = excluded.value_json,
            updated_at = now()
      returning value_json
    `;
    return rows?.[0]?.value_json || settings;
  }
  await localWrite(settingsFile, settings);
  return settings;
}

export async function listBookings() {
  if (useDatabase()) {
    await expireOldHolds();
    const rows = await (await db())`select * from public.bookings order by starts_at desc`;
    return rows.map(normalizeBooking);
  }
  return localRead(bookingsFile, []);
}

export async function findBooking(publicIdValue) {
  if (useDatabase()) {
    await expireOldHolds();
    const rows = await (await db())`select * from public.bookings where public_id = ${publicIdValue} limit 1`;
    return normalizeBooking(rows?.[0] || null);
  }
  return (await listBookings()).find(b => b.publicId === publicIdValue || b.public_id === publicIdValue) || null;
}

export async function createHold(input, settings) {
  const manageToken = token(24);
  const record = {
    id: crypto.randomUUID(),
    publicId: publicId('bkg'),
    serviceName: settings.serviceName,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerNote: input.customerNote || '',
    styleId: input.styleId,
    styleTitle: input.styleTitle,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: settings.timezone,
    status: 'PENDING_PAYMENT',
    holdExpiresAt: new Date(Date.now() + settings.holdMinutes * 60_000).toISOString(),
    amountPaidCents: 0,
    currency: settings.currency,
    manageTokenHash: sha256(manageToken),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (useDatabase()) {
    try {
      const rows = await (await db()).query(
        `select * from public.create_booking_hold($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          record.publicId,
          record.serviceName,
          record.customerName,
          record.customerEmail,
          record.customerPhone,
          record.customerNote,
          record.styleId,
          record.styleTitle,
          record.startsAt,
          record.endsAt,
          record.holdExpiresAt,
          record.manageTokenHash
        ]
      );
      const created = Array.isArray(rows) ? rows[0] : rows;
      return { booking: normalizeBooking(created), manageToken };
    } catch (error) {
      if (String(error?.message || error).includes('SLOT_TAKEN') || String(error?.code || '') === '23P01') {
        throw new Error('SLOT_TAKEN');
      }
      throw error;
    }
  }

  return queue = queue.then(async () => {
    const bookings = await localRead(bookingsFile, []);
    const collision = bookings.some(b => ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status) && (b.status === 'CONFIRMED' || new Date(b.holdExpiresAt) > new Date()) && overlaps(new Date(record.startsAt), new Date(record.endsAt), new Date(b.startsAt), new Date(b.endsAt)));
    if (collision) throw new Error('SLOT_TAKEN');
    bookings.push(record);
    await localWrite(bookingsFile, bookings);
    return { booking: record, manageToken };
  });
}

export async function updateBooking(publicIdValue, patch) {
  if (useDatabase()) {
    const map = {
      status: 'status',
      amountPaidCents: 'amount_paid_cents',
      stripeCheckoutSessionId: 'stripe_checkout_session_id',
      stripePaymentIntentId: 'stripe_payment_intent_id',
      confirmedAt: 'confirmed_at',
      cancelledAt: 'cancelled_at',
      cancelReason: 'cancel_reason',
      completedAt: 'completed_at',
      manageTokenHash: 'manage_token_hash'
    };
    const entries = Object.entries(patch).filter(([key]) => map[key]);
    if (!entries.length) return findBooking(publicIdValue);
    const values = entries.map(([, value]) => value);
    const assignments = entries.map(([key], index) => `${map[key]} = $${index + 1}`);
    values.push(new Date().toISOString(), publicIdValue);
    const rows = await (await db()).query(
      `update public.bookings set ${assignments.join(', ')}, updated_at = $${values.length - 1} where public_id = $${values.length} returning *`,
      values
    );
    return normalizeBooking(rows?.[0] || null);
  }
  return queue = queue.then(async () => {
    const bookings = await localRead(bookingsFile, []);
    const index = bookings.findIndex(b => b.publicId === publicIdValue);
    if (index < 0) return null;
    bookings[index] = { ...bookings[index], ...patch, updatedAt: new Date().toISOString() };
    await localWrite(bookingsFile, bookings);
    return bookings[index];
  });
}

export async function findByManageToken(raw) {
  const hash = sha256(raw);
  if (useDatabase()) {
    const rows = await (await db())`select * from public.bookings where manage_token_hash = ${hash} limit 1`;
    return normalizeBooking(rows?.[0] || null);
  }
  const rows = await listBookings();
  return rows.find(b => (b.manageTokenHash || b.manage_token_hash) === hash) || null;
}

export async function claimStripeEvent(eventId, eventType) {
  if (!eventId) return false;
  if (useDatabase()) {
    const rows = await (await db())`
      insert into public.stripe_events(stripe_event_id, event_type, status)
      values (${eventId}, ${eventType}, 'processing')
      on conflict (stripe_event_id) do nothing
      returning stripe_event_id
    `;
    return Boolean(rows?.length);
  }
  return queue = queue.then(async () => {
    const events = await localRead(stripeEventsFile, []);
    if (events.some(event => event.id === eventId)) return false;
    events.push({ id: eventId, type: eventType, createdAt: new Date().toISOString() });
    await localWrite(stripeEventsFile, events.slice(-1000));
    return true;
  });
}

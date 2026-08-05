import { URL } from 'node:url';
import { json, readJson, readRawBody, token, sha256, isValidEmail, normalizePhone } from './utils.mjs';
import { createAdminSession, adminCookie, clearAdminCookie, isAdmin, verifyAdminPassword } from './auth.mjs';
import { generateAvailability, overlaps } from './availability.mjs';
import { claimStripeEvent, createHold, findBooking, findByManageToken, getSettings, listBookings, updateBooking, updateSettings } from './repository.mjs';
import { buildPaymentUrl, retrieveCheckoutSession, verifyStripeSignature } from './stripe.mjs';
import { sendAdminNotification, sendConfirmation } from './email.mjs';

function routePath(req) {
  const url = new URL(req.url, 'http://localhost');
  const rewritten = url.searchParams.get('route');
  return rewritten ? `/api/${rewritten.replace(/^\/+/, '')}` : url.pathname;
}

function bookingPublic(booking) {
  if (!booking) return null;
  return {
    publicId: booking.publicId,
    serviceName: booking.serviceName || 'Pánsky strih',
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    customerNote: booking.customerNote,
    styleId: booking.styleId,
    styleTitle: booking.styleTitle,
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    timezone: booking.timezone || 'Europe/Bratislava',
    status: booking.status,
    holdExpiresAt: booking.holdExpiresAt,
    amountPaidCents: booking.amountPaidCents || 0,
    currency: booking.currency || 'EUR',
    createdAt: booking.createdAt
  };
}

function validateHold(input) {
  const errors = {};
  if (!String(input.customerName || '').trim() || String(input.customerName).trim().length < 2) errors.customerName = 'Zadaj meno a priezvisko.';
  if (!isValidEmail(input.customerEmail)) errors.customerEmail = 'Zadaj platný e-mail.';
  const phone = normalizePhone(input.customerPhone);
  if (phone.length < 9 || phone.length > 16) errors.customerPhone = 'Zadaj platné telefónne číslo.';
  if (!input.startsAt || Number.isNaN(Date.parse(input.startsAt))) errors.startsAt = 'Vyber platný termín.';
  if (!input.endsAt || Number.isNaN(Date.parse(input.endsAt))) errors.endsAt = 'Vyber platný termín.';
  if (!String(input.styleId || '').trim()) errors.styleId = 'Vyber si vibe.';
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { ...input, customerName: String(input.customerName).trim().slice(0,80), customerEmail: String(input.customerEmail).trim().toLowerCase(), customerPhone: phone, customerNote: String(input.customerNote || '').trim().slice(0,500), styleId: String(input.styleId).slice(0,64), styleTitle: String(input.styleTitle || '').slice(0,120) } };
}

async function confirmBooking(booking, session = {}) {
  if (!booking) return null;
  if (booking.status === 'CONFIRMED') return booking;
  const all = await listBookings();
  const collision = all.some(other => other.publicId !== booking.publicId && ['PENDING_PAYMENT','CONFIRMED'].includes(other.status) && (other.status === 'CONFIRMED' || !other.holdExpiresAt || new Date(other.holdExpiresAt) > new Date()) && overlaps(new Date(booking.startsAt), new Date(booking.endsAt), new Date(other.startsAt), new Date(other.endsAt)));
  if (collision) {
    return updateBooking(booking.publicId, {
      status: 'PAYMENT_EXCEPTION',
      amountPaidCents: Number(session.amount_total || 1000),
      stripeCheckoutSessionId: session.id || booking.stripeCheckoutSessionId || null,
      stripePaymentIntentId: session.payment_intent || booking.stripePaymentIntentId || null
    });
  }
  const freshManageToken = token(24);
  let confirmed;
  try {
    confirmed = await updateBooking(booking.publicId, {
      status: 'CONFIRMED',
      amountPaidCents: Number(session.amount_total || 1000),
      stripeCheckoutSessionId: session.id || booking.stripeCheckoutSessionId || null,
      stripePaymentIntentId: session.payment_intent || booking.stripePaymentIntentId || null,
      confirmedAt: new Date().toISOString(),
      manageTokenHash: sha256(freshManageToken)
    });
  } catch (error) {
    if (String(error.message).includes('23P01') || String(error.message).includes('exclusion')) {
      return updateBooking(booking.publicId, { status: 'PAYMENT_EXCEPTION', amountPaidCents: Number(session.amount_total || 1000) });
    }
    throw error;
  }
  const settings = await getSettings();
  await Promise.allSettled([
    sendConfirmation(confirmed, settings, freshManageToken),
    sendAdminNotification(confirmed, settings)
  ]);
  return { ...confirmed, manageToken: freshManageToken };
}

function adminOnly(req, res) {
  if (!isAdmin(req)) {
    json(res, 401, { error: 'UNAUTHORIZED' });
    return false;
  }
  return true;
}

function createIcs(booking, settings) {
  const clean = value => String(value || '').replace(/[\\;,\n]/g, ' ');
  const stamp = date => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KOTRASKO//Booking//SK', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${booking.publicId}@kotrasko`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(booking.startsAt)}`, `DTEND:${stamp(booking.endsAt)}`,
    `SUMMARY:${clean(settings.serviceName)} — KOTRASKO`, `LOCATION:${clean(`${settings.shopName}, ${settings.address}`)}`, `DESCRIPTION:${clean('Rezervácia strihu u Kotraska. Pri zrušení najskôr telefonicky kontaktuj prevádzku.')}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
}

export async function handleApi(req, res) {
  const path = routePath(req);
  const method = req.method || 'GET';

  try {
    if (method === 'GET' && path === '/api/config') {
      const settings = await getSettings();
      return json(res, 200, {
        brandName: settings.brandName,
        shopName: settings.shopName,
        location: settings.location,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        instagram: settings.instagram,
        serviceName: settings.serviceName,
        priceCents: settings.priceCents,
        currency: settings.currency,
        durationMinutes: settings.durationMinutes,
        demoMode: String(process.env.DEMO_MODE ?? 'true') === 'true'
      });
    }

    if (method === 'GET' && path === '/api/availability') {
      const settings = await getSettings();
      const bookings = await listBookings();
      return json(res, 200, { days: generateAvailability(settings, bookings), timezone: settings.timezone });
    }

    if (method === 'POST' && path === '/api/bookings/hold') {
      const input = await readJson(req);
      const parsed = validateHold(input);
      if (!parsed.ok) return json(res, 422, { error: 'VALIDATION_ERROR', fields: parsed.errors });
      const settings = await getSettings();
      const start = new Date(parsed.value.startsAt);
      const min = new Date(Date.now() + settings.minimumNoticeHours * 60 * 60 * 1000);
      const max = new Date(Date.now() + (settings.bookingHorizonDays + 1) * 24 * 60 * 60 * 1000);
      if (start < min || start > max) return json(res, 409, { error: 'OUTSIDE_BOOKING_WINDOW' });
      const available = generateAvailability(settings, await listBookings()).flatMap(d => d.slots).some(s => s.startsAt === parsed.value.startsAt && s.endsAt === parsed.value.endsAt);
      if (!available) return json(res, 409, { error: 'SLOT_TAKEN' });
      const { booking, manageToken } = await createHold(parsed.value, settings);
      const base = process.env.STRIPE_PAYMENT_LINK_TEST || 'https://buy.stripe.com/test_28E8wQ3x465u2hNbr5fnO0m';
      return json(res, 201, {
        booking: bookingPublic(booking),
        manageToken,
        paymentUrl: buildPaymentUrl(base, booking, parsed.value.customerEmail),
        demoSuccessUrl: `/?success=${encodeURIComponent(booking.publicId)}`
      });
    }

    const manageMatch = path.match(/^\/api\/manage\/([^/]+)$/);
    if (method === 'GET' && manageMatch) {
      const booking = await findByManageToken(decodeURIComponent(manageMatch[1]));
      if (!booking) return json(res, 404, { error: 'NOT_FOUND' });
      return json(res, 200, { booking: bookingPublic(booking) });
    }

    const bookingMatch = path.match(/^\/api\/bookings\/([^/]+)$/);
    if (method === 'GET' && bookingMatch) {
      const booking = await findBooking(decodeURIComponent(bookingMatch[1]));
      if (!booking) return json(res, 404, { error: 'NOT_FOUND' });
      return json(res, 200, { booking: bookingPublic(booking) });
    }

    const cancelMatch = path.match(/^\/api\/bookings\/([^/]+)\/cancel$/);
    if (method === 'POST' && cancelMatch) {
      const input = await readJson(req);
      const booking = await findByManageToken(input.manageToken || '');
      if (!booking || booking.publicId !== decodeURIComponent(cancelMatch[1])) return json(res, 403, { error: 'INVALID_MANAGE_TOKEN' });
      if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) return json(res, 409, { error: 'CANNOT_CANCEL' });
      const updated = await updateBooking(booking.publicId, { status: 'CANCELLED_BY_CUSTOMER', cancelReason: String(input.reason || '').slice(0,300), cancelledAt: new Date().toISOString() });
      return json(res, 200, { booking: bookingPublic(updated) });
    }

    const icsMatch = path.match(/^\/api\/bookings\/([^/]+)\/ics$/);
    if (method === 'GET' && icsMatch) {
      const url = new URL(req.url, 'http://localhost');
      const booking = await findByManageToken(url.searchParams.get('token') || '');
      if (!booking || booking.publicId !== decodeURIComponent(icsMatch[1])) return json(res, 403, { error: 'INVALID_MANAGE_TOKEN' });
      const settings = await getSettings();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="kotrasko-termin.ics"');
      return res.end(createIcs(booking, settings));
    }

    if (method === 'POST' && path === '/api/demo/confirm') {
      if (String(process.env.DEMO_MODE ?? 'true') !== 'true') return json(res, 404, { error: 'NOT_FOUND' });
      const input = await readJson(req);
      const booking = await findBooking(input.publicId || '');
      if (!booking) return json(res, 404, { error: 'NOT_FOUND' });
      const confirmed = await confirmBooking(booking, { id: `demo_${Date.now()}`, amount_total: 1000, payment_intent: `demo_pi_${Date.now()}` });
      return json(res, 200, { booking: bookingPublic(confirmed), manageToken: confirmed.manageToken });
    }

    if (method === 'POST' && path === '/api/stripe/webhook') {
      const raw = await readRawBody(req, 2 * 1024 * 1024);
      if (!verifyStripeSignature(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) return json(res, 400, { error: 'INVALID_SIGNATURE' });
      const event = JSON.parse(raw.toString('utf8'));
      if (!(await claimStripeEvent(event.id, event.type))) return json(res, 200, { received: true, duplicate: true });
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const booking = await findBooking(session.client_reference_id || '');
        if (booking && session.payment_status === 'paid') await confirmBooking(booking, session);
      }
      return json(res, 200, { received: true });
    }

    const sessionMatch = path.match(/^\/api\/stripe\/session\/([^/]+)$/);
    if (method === 'GET' && sessionMatch) {
      const session = await retrieveCheckoutSession(decodeURIComponent(sessionMatch[1]));
      let booking = null;
      if (session.client_reference_id) booking = await findBooking(session.client_reference_id);
      if (booking && session.payment_status === 'paid') booking = await confirmBooking(booking, session);
      return json(res, 200, { session: { id: session.id, paymentStatus: session.payment_status, clientReferenceId: session.client_reference_id }, booking: bookingPublic(booking) });
    }

    if (method === 'POST' && path === '/api/admin/login') {
      const input = await readJson(req);
      if (!verifyAdminPassword(input.password)) return json(res, 401, { error: 'INVALID_PASSWORD' });
      return json(res, 200, { ok: true }, { 'Set-Cookie': adminCookie(createAdminSession()) });
    }

    if (method === 'POST' && path === '/api/admin/logout') {
      return json(res, 200, { ok: true }, { 'Set-Cookie': clearAdminCookie() });
    }

    if (method === 'GET' && path === '/api/admin/session') {
      return json(res, 200, { authenticated: isAdmin(req) });
    }

    if (method === 'GET' && path === '/api/admin/bookings') {
      if (!adminOnly(req, res)) return;
      return json(res, 200, { bookings: (await listBookings()).map(bookingPublic) });
    }

    if (method === 'GET' && path === '/api/admin/settings') {
      if (!adminOnly(req, res)) return;
      return json(res, 200, { settings: await getSettings() });
    }

    if (method === 'PUT' && path === '/api/admin/settings') {
      if (!adminOnly(req, res)) return;
      const current = await getSettings();
      const input = await readJson(req);
      const allowed = ['brandName','shopName','location','address','phone','email','instagram','serviceName','priceCents','durationMinutes','minimumNoticeHours','bookingHorizonDays','holdMinutes','weeklyAvailability','blockedSlots'];
      const patch = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
      return json(res, 200, { settings: await updateSettings({ ...current, ...patch }) });
    }

    const adminBookingMatch = path.match(/^\/api\/admin\/bookings\/([^/]+)$/);
    if (method === 'PATCH' && adminBookingMatch) {
      if (!adminOnly(req, res)) return;
      const input = await readJson(req);
      const allowedStatuses = ['PENDING_PAYMENT','CONFIRMED','COMPLETED','CANCELLED_BY_CUSTOMER','CANCELLED_BY_ADMIN','NO_SHOW','PAYMENT_EXCEPTION','REFUNDED'];
      if (input.status && !allowedStatuses.includes(input.status)) return json(res, 422, { error: 'INVALID_STATUS' });
      const booking = await updateBooking(decodeURIComponent(adminBookingMatch[1]), { ...(input.status ? { status: input.status } : {}) });
      if (!booking) return json(res, 404, { error: 'NOT_FOUND' });
      return json(res, 200, { booking: bookingPublic(booking) });
    }

    return json(res, 404, { error: 'NOT_FOUND', path });
  } catch (error) {
    console.error(error);
    if (error.message === 'SLOT_TAKEN') return json(res, 409, { error: 'SLOT_TAKEN' });
    if (error.message === 'PAYLOAD_TOO_LARGE') return json(res, 413, { error: 'PAYLOAD_TOO_LARGE' });
    if (error.message === 'INVALID_JSON') return json(res, 400, { error: 'INVALID_JSON' });
    if (error.message === 'STRIPE_NOT_CONFIGURED') return json(res, 503, { error: 'STRIPE_NOT_CONFIGURED' });
    return json(res, 500, { error: 'INTERNAL_ERROR' });
  }
}

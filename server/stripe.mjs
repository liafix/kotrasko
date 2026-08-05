import crypto from 'node:crypto';
import { safeEqual } from './utils.mjs';

export function buildPaymentUrl(base, booking, email) {
  const url = new URL(base);
  url.searchParams.set('client_reference_id', booking.publicId || booking.public_id);
  if (email) url.searchParams.set('prefilled_email', email);
  return url.toString();
}

export function verifyStripeSignature(rawBody, header, secret, toleranceSeconds = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map(v => v.split('=')));
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!timestamp || !signature || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  return safeEqual(signature, expected);
}

export async function retrieveCheckoutSession(sessionId) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_NOT_CONFIGURED');
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
  });
  if (!response.ok) throw new Error(`STRIPE_${response.status}_${await response.text()}`);
  return response.json();
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { overlaps } from '../server/availability.mjs';
import { buildPaymentUrl, verifyStripeSignature } from '../server/stripe.mjs';
import crypto from 'node:crypto';

test('overlap detects intersecting intervals and allows touching edges',()=>{
  const a1=new Date('2026-08-10T08:00:00Z'),a2=new Date('2026-08-10T09:00:00Z');
  assert.equal(overlaps(a1,a2,new Date('2026-08-10T08:30:00Z'),new Date('2026-08-10T09:30:00Z')),true);
  assert.equal(overlaps(a1,a2,new Date('2026-08-10T09:00:00Z'),new Date('2026-08-10T10:00:00Z')),false);
});

test('payment link receives opaque client reference id and email',()=>{
  const url=new URL(buildPaymentUrl('https://buy.stripe.com/test_example',{publicId:'bkg_safe123'},'test@example.com'));
  assert.equal(url.searchParams.get('client_reference_id'),'bkg_safe123');
  assert.equal(url.searchParams.get('prefilled_email'),'test@example.com');
});

test('Stripe signature verification accepts valid payload',()=>{
  const secret='whsec_test';const raw=Buffer.from('{"id":"evt_test"}');const t=Math.floor(Date.now()/1000);
  const sig=crypto.createHmac('sha256',secret).update(`${t}.${raw}`).digest('hex');
  assert.equal(verifyStripeSignature(raw,`t=${t},v1=${sig}`,secret),true);
});

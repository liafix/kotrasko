CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  service_name text NOT NULL DEFAULT 'Pánsky strih',
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_note text NOT NULL DEFAULT '',
  style_id text NOT NULL,
  style_title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Bratislava',
  status text NOT NULL CHECK (status IN ('DRAFT','PENDING_PAYMENT','CONFIRMED','EXPIRED','COMPLETED','CANCELLED_BY_CUSTOMER','CANCELLED_BY_ADMIN','NO_SHOW','PAYMENT_EXCEPTION','REFUND_PENDING','REFUNDED')),
  hold_expires_at timestamptz,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_paid_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  manage_token_hash text NOT NULL,
  cancel_reason text,
  cancelled_at timestamptz,
  confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_interval_valid CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS bookings_starts_at_idx ON public.bookings(starts_at);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_session_unique ON public.bookings(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_no_active_overlap;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_active_overlap
  EXCLUDE USING gist (tstzrange(starts_at, ends_at, '[)') WITH &&)
  WHERE (status IN ('PENDING_PAYMENT','CONFIRMED'));

CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings(key, value_json)
VALUES ('app', '{
  "brandName":"KOTRASKO",
  "shopName":"Big Head House Barbershop",
  "location":"Ilava",
  "address":"Mierové námestie 93/26, 019 01 Ilava",
  "phone":"",
  "email":"dczwebagentsi@gmail.com",
  "instagram":"https://www.instagram.com/kotrasko",
  "serviceName":"Pánsky strih",
  "priceCents":1000,
  "currency":"EUR",
  "durationMinutes":60,
  "minimumNoticeHours":2,
  "bookingHorizonDays":30,
  "holdMinutes":15,
  "timezone":"Europe/Bratislava",
  "weeklyAvailability":{"1":[{"start":"09:00","end":"19:00"}],"2":[{"start":"09:00","end":"19:00"}],"3":[{"start":"09:00","end":"19:00"}],"4":[{"start":"09:00","end":"19:00"}],"5":[{"start":"09:00","end":"19:00"}],"6":[],"0":[]},
  "blockedSlots":[]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_public_id text,
  p_service_name text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_note text,
  p_style_id text,
  p_style_title text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_hold_expires_at timestamptz,
  p_manage_token_hash text
) RETURNS SETOF public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bookings
     SET status = 'EXPIRED', updated_at = now()
   WHERE status = 'PENDING_PAYMENT' AND hold_expires_at <= now();

  RETURN QUERY
  INSERT INTO public.bookings(
    public_id, service_name, customer_name, customer_email, customer_phone, customer_note,
    style_id, style_title, starts_at, ends_at, status, hold_expires_at, manage_token_hash
  ) VALUES (
    p_public_id, p_service_name, p_customer_name, lower(p_customer_email), p_customer_phone, coalesce(p_customer_note,''),
    p_style_id, p_style_title, p_starts_at, p_ends_at, 'PENDING_PAYMENT', p_hold_expires_at, p_manage_token_hash
  ) RETURNING *;
EXCEPTION
  WHEN exclusion_violation THEN
    RAISE EXCEPTION 'SLOT_TAKEN' USING ERRCODE = '23P01';
END;
$$;

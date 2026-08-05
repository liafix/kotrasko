# KOTRASKO Booking Experience

A premium, mobile-first booking experience for Kotrasko at Big Head House Barbershop in Ilava.

The implementation follows the approved product blueprint: the client chooses a haircut vibe, selects a 60-minute slot, enters contact details, creates a 15-minute hold, and continues to a €10 Stripe Payment Link. The system includes an experiential confirmation view, booking management/cancellation, ICS calendar export, and a single-barber admin dashboard.

## Included

- cinematic responsive landing page,
- real Kotrasko portfolio assets prepared from supplied screenshots,
- multi-step booking drawer,
- 30-day availability and two-hour minimum notice,
- collision-safe local repository and Neon Postgres production persistence,
- 15-minute payment hold,
- supplied Stripe test Payment Link with `client_reference_id`,
- Stripe webhook signature verification and idempotent confirmation logic,
- optional Resend confirmation/admin e-mails,
- signed-cookie admin login,
- booking dashboard, status management, and availability editor,
- customer manage/cancel flow,
- Google Calendar and `.ics` support,
- reduced-motion and keyboard-focus support,
- Vercel + Neon deployment files.

## Run locally

No third-party npm dependencies are required.

```bash
cp .env.example .env
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Demo admin password: `kotrasko-demo`

The local demo stores data in JSON files. Set `DEMO_MODE=true` to use the “Lokálny test bez platby” action and verify the full success flow without completing Stripe Checkout.

## Architecture note

The approved blueprint proposed Next.js. This delivery intentionally uses a zero-dependency Node.js + browser-native ES module architecture while preserving Vercel, Neon Postgres, Stripe, Resend, the booking state model, and the approved visual experience. See `docs/TECHNICAL_DECISIONS.md`.

## Production

Read `docs/DEPLOYMENT.md`. A production Vercel deployment requires Neon Postgres, Stripe secrets/webhook configuration, a live Stripe Payment Link, and confirmed contact/legal data.

## Important status

This package is a complete working test MVP. It is not ready for public live payments until the live Stripe configuration, Neon database, e-mail domain, final Kotrasko schedule, contact number, refund rules, consents, and DNS are supplied.

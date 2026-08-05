# Technical decisions and intentional deviations

## Runtime architecture

The approved plan proposed Next.js. This implementation uses a zero-dependency Node.js server, browser-native ES modules, Vercel serverless functions, Supabase REST/RPC, Stripe REST/webhooks, and Resend HTTP APIs.

The change is intentional:

- the package runs immediately with `npm run dev` and no dependency installation,
- the frontend remains component-like and fully interactive without a build framework,
- Vercel, Supabase, Stripe, Resend, signed admin sessions, server-side validation, and the booking state model remain supported,
- the codebase has a smaller client bundle and fewer supply-chain dependencies,
- migration to Next.js later is possible because the API, repository, and UI concerns are separated.

## Persistence

- Local development: JSON files under `data/`.
- Vercel production: Supabase is mandatory because a serverless filesystem is not persistent.
- The Supabase migration includes a PostgreSQL exclusion constraint and an atomic `create_booking_hold` RPC to prevent overlapping active reservations.

## Stripe

The supplied test Payment Link is used with an opaque `client_reference_id`. A 15-minute booking hold is created before Stripe. The webhook verifies the Stripe signature, claims each Stripe event once, checks for a late-payment slot collision, and only then confirms the booking.

A payment completed after its slot was taken is marked `PAYMENT_EXCEPTION` instead of sending a false confirmation.

## E-mail and cancellation

Resend is optional in local mode and required for production e-mails. Confirmation creates a fresh manage token, stores only its SHA-256 hash, and e-mails the raw token to the client. Automatic refunds are intentionally not included.

## Remaining launch dependencies

The codebase is ready as a test MVP. Public launch still requires live Stripe credentials/link, a Supabase project, a verified e-mail domain, final contact number, final Kotrasko schedule, photo/logo permissions, refund/cancellation text, and DNS access.

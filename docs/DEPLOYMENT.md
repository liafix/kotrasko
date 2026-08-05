# Deployment runbook

## 1. Local preview

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`. Without `DATABASE_URL`, the local server persists demo data in `data/bookings.json` and `data/settings.json`.

Admin: `http://localhost:3000/admin`  
Default local password: `kotrasko-demo`

## 2. Neon Postgres

1. Create a Neon project.
2. Run `db/migrations/0001_init.sql`.
3. Add the pooled `DATABASE_URL` to Vercel for Production and Preview.
4. Never expose `DATABASE_URL` to browser code.

The production deployment uses Neon because the Vercel serverless filesystem is not persistent.

## 3. Stripe

The included test Payment Link is:

`https://buy.stripe.com/test_28E8wQ3x465u2hNbr5fnO0m`

Set `STRIPE_PAYMENT_LINK_TEST`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`. Configure the Payment Link redirect as:

`https://YOUR-DOMAIN.vercel.app/?session_id={CHECKOUT_SESSION_ID}`

Create a webhook endpoint at:

`https://YOUR-DOMAIN.vercel.app/api/stripe/webhook`

Subscribe to `checkout.session.completed`. The webhook, not the success page, is the source of truth.

## 4. E-mail

Set `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL`. Verify the sending domain before public launch.

## 5. Vercel

Import the GitHub repository, use Node.js 20, root `./`, install command `npm install`, build command `npm run build`, and output directory `dist`. Add all runtime environment variables and set a strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

## 6. Before public launch

Replace test Stripe credentials with live credentials, confirm the working schedule, contact details, refund rules, photograph permissions, Big Head House logo permission, and DNS/subdomain access.

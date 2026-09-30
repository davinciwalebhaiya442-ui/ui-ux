# Phase 2 setup

Phase 2 adds Supabase Auth, customer profiles, free-download access, library history, and private Cloudflare R2 signed downloads. The existing visual frontend remains unchanged.

## 1. Supabase

1. Create a Supabase project and copy its Project URL and anon key.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`.
3. Configure Auth > URL Configuration with the local site URL (for example `http://localhost:3000`) and redirect URL `/reset-password`.
4. Enable email/password authentication and configure the email provider.
5. Use the project PostgreSQL URL as `DATABASE_URL` when deploying the Prisma schema to Supabase. Run `npm run db:migrate` and `npm run db:seed`.

The service-role key is not needed by browser code and must remain server-only if used for future admin tooling. Roles are assigned server-side as `customer`; signup cannot submit `admin`.

## 2. Cloudflare R2

1. Create a private R2 bucket.
2. Create an R2 API token with object read/write permissions for that bucket.
3. Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` to `.env`.
4. Store only object keys on products, such as `products/auto-tracer/v1/auto-tracer.zip`; never add private ZIP files to `public/`.

The storage layer in `src/lib/storage/r2.js` creates 10-minute signed URLs. The download route authenticates the user, verifies publication and access, records the download, and applies a basic per-user rate limit.

## Phase 3–5 notes

Payment, content, Studio, FAQ, tools, sitemap, robots, and SEO foundations are included in the current app. Add Razorpay and Resend values before testing payment; without them checkout returns a safe `PAYMENT_UNAVAILABLE` response. Razorpay webhooks must target `/api/webhooks/razorpay` and use the configured webhook secret. Never expose secret values through `NEXT_PUBLIC_` variables.

## 3. Run and test

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Create a test account at `/signup`, confirm the email if enabled, and log in. A free product becomes available in `/account/library` only after a successful authenticated download request. Paid products return `PURCHASE_REQUIRED` until Phase 3 adds Razorpay purchase access. Without R2 credentials or a product object key, the app safely returns `DOWNLOAD_UNAVAILABLE`.

Admin visibility is available at `/admin/users` and `/admin/downloads` using the existing `ADMIN_KEY` header mechanism. No passwords or storage credentials are returned to the client.

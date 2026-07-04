# AP Auto Parts — Website & Business Manager

A full-stack web application for **AP Auto Parts**, an auto-parts manufacturing company. It combines:

1. **Public website** — company profile, product catalog with categories, product detail pages, and a contact/enquiry form (with WhatsApp click-to-chat).
2. **Admin panel** (`/admin`) — day-to-day operations:
   - **Enquiries** — inbox for website enquiries with a status workflow (NEW → CONTACTED → QUOTED → WON/CLOSED) and internal notes
   - **Products & Categories** — full catalog management with image upload, publish/feature toggles
   - **Customers** — dealer/distributor directory with GSTIN and order history
   - **Orders & Quotations** — convert an enquiry into a quotation, print/save it as PDF, move it through QUOTATION → CONFIRMED → IN_PRODUCTION → DISPATCHED → DELIVERED
   - **Inventory** — stock in/out register per product; dispatching an order deducts stock automatically; low-stock alerts on the dashboard
   - **Invoices & Payments** — generate GST tax invoices (CGST/SGST or IGST) from orders, print/save as PDF, record payments (UPI/NEFT/cheque/cash), track outstanding balances
   - **Reports** — monthly invoiced sales, top products, outstanding receivables per customer

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) — public site + admin in one codebase
- [Tailwind CSS](https://tailwindcss.com) v4
- [Prisma](https://prisma.io) ORM with PostgreSQL
- [NextAuth](https://next-auth.js.org) credentials login for the admin panel
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for product image uploads in production (falls back to `public/uploads/` locally)

## Getting Started

You need a Postgres database — either local (`createdb apautoparts`) or a free
[Neon](https://neon.tech) database (use its connection string in `.env`).

```bash
npm install
cp .env.example .env       # set DATABASE_URL and NEXTAUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev     # creates the tables and seeds sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the website and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

**Default admin login (from seed):** `admin@apautoparts.com` / `admin123` — change this before going live.

## Deploying to Vercel

The repo is pre-configured: the `vercel-build` script runs `prisma generate && prisma migrate deploy && next build`, so database migrations apply automatically on every deploy.

1. **Push this repo to GitHub** (already done if you're reading this there).
2. **Create the database** — sign up at [neon.tech](https://neon.tech) (free), create a project, and copy the **pooled connection string** (starts with `postgresql://…-pooler…`). Alternatively add *Neon Postgres* from the Vercel Marketplace after step 3, which sets `DATABASE_URL` for you.
3. **Import the project** — at [vercel.com/new](https://vercel.com/new), sign in with GitHub, select this repository, framework preset *Next.js* (auto-detected).
4. **Set environment variables** in the import screen (or Project → Settings → Environment Variables):
   - `DATABASE_URL` — the Neon pooled connection string
   - `NEXTAUTH_SECRET` — output of `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL, e.g. `https://ap-auto-parts.vercel.app` (update after the first deploy if needed)
5. **Deploy.** Migrations run during the build.
6. **Seed the first admin user** — from your machine, run the seed against production once:
   ```bash
   DATABASE_URL="<neon connection string>" npx prisma db seed
   ```
7. **Enable image uploads** — in the Vercel project, go to *Storage → Create Database → Blob*. Connecting it sets `BLOB_READ_WRITE_TOKEN` automatically; product photo uploads then go to Blob storage. Redeploy once after connecting.

## Before Going Live — Checklist

- [ ] Replace placeholder company details (phone, WhatsApp, email, address, GSTIN) in `src/lib/company.ts`
- [ ] Replace the seeded sample products with real products (via the admin panel)
- [ ] Change the admin password / create real users (see `prisma/seed.ts`)
- [ ] Set a strong `NEXTAUTH_SECRET` and correct `NEXTAUTH_URL`

## End-to-End Smoke Test

With the dev server running:

```bash
node scripts/e2e-check.mjs
```

Drives a real browser through the whole business flow: public enquiry → admin login → customer → quotation → order pipeline → stock deduction → GST invoice → payments → reports. Screenshots land in `e2e-screenshots/`.

## Project Structure

```
prisma/schema.prisma          # all data models (products, enquiries, orders, stock, invoices…)
prisma/seed.ts                # admin user + sample catalog
src/app/(public)/             # website: home, about, products, contact
src/app/admin/                # admin panel (login + guarded dashboard)
src/lib/actions/              # server actions (all mutations, auth-guarded)
src/lib/                      # db client, auth config, company details, helpers
src/components/               # shared UI components
```

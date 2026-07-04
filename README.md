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
- [Prisma](https://prisma.io) ORM with SQLite for development (swap `DATABASE_URL` + provider for Postgres in production)
- [NextAuth](https://next-auth.js.org) credentials login for the admin panel

## Getting Started

```bash
npm install
cp .env.example .env       # then set NEXTAUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev     # creates the SQLite DB and seeds sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the website and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

**Default admin login (from seed):** `admin@apautoparts.com` / `admin123` — change this before going live.

## Before Going Live — Checklist

- [ ] Replace placeholder company details (phone, WhatsApp, email, address, GSTIN) in `src/lib/company.ts`
- [ ] Replace the seeded sample products with real products (via the admin panel)
- [ ] Change the admin password / create real users (see `prisma/seed.ts`)
- [ ] Set a strong `NEXTAUTH_SECRET` and correct `NEXTAUTH_URL`
- [ ] For production hosting, switch to Postgres (Neon/Supabase): change `provider` in `prisma/schema.prisma` and `DATABASE_URL`, then `npx prisma migrate deploy`
- [ ] Note: image uploads are written to `public/uploads/` — this works on a VPS/self-hosted server. On serverless hosts (Vercel), switch uploads to Cloudinary/S3.

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

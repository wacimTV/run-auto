# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Marketing site + booking system for RUN AUTO, an auto repair garage in Marseille (French-language UI, content, and code comments — keep new user-facing text in French). Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/turbopack` loader in `next.config.ts`), Framer Motion, date-fns (`fr` locale), lucide-react.

Next.js 16 differs from older versions — per AGENTS.md, check `node_modules/next/dist/docs/` before using Next APIs (e.g. `cookies()` is async).

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript)

There is no test suite. Verify changes with `npm run lint`, `npm run build`, and by running the app.

## Architecture

**Single source of truth: [src/config/garage.ts](src/config/garage.ts).** `GARAGE_CONFIG` holds contact info, address, opening hours, legal info, reviews, and the full service catalogue (`SERVICE_CATEGORIES`, services with slugs, interventions, related slugs, images). Pages, components, the booking slot engine, `sitemap.ts`, JSON-LD in `layout.tsx`, and `prestations/[slug]` (`generateStaticParams` + `getServiceBySlug`) all read from it. To change hours, phone, or add/rename a service, edit this file — not the components. When renaming a service slug, add a permanent redirect in `next.config.ts` (existing examples there) to preserve SEO.

**Persistence: [src/lib/storage.ts](src/lib/storage.ts)** — async store with two backends. When `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` are set, it uses Supabase (tables from `supabase/schema.sql`, RLS on with no public policies, so only the server-side service-role client reads and writes; a partial unique index on `(appointment_date, appointment_time) WHERE status <> 'cancelled'` enforces no double booking, and Postgres error `23505` is mapped to the double-booking message). Without those vars it falls back to the local JSON file `data/storage.json` (dev only); on Vercel (`VERCEL` env set) it refuses to run without Supabase, because the serverless disk isn't persistent.

**Booking flow:**
- [src/lib/availability.ts](src/lib/availability.ts) generates 60-min slots from `GARAGE_CONFIG.openingHours`, removing blocked dates/slots and already-booked `(date, time)` pairs.
- `GET /api/slots` exposes availability to [src/components/BookingWizard.tsx](src/components/BookingWizard.tsx) (multi-step client wizard).
- `POST /api/appointments` validates input ([src/lib/validation.ts](src/lib/validation.ts)), rejects honeypot submissions (`website_trap` field), re-checks `isSlotAvailable` server-side to prevent double booking, stores with status `pending`, and calls `sendAppointmentNotifications` ([src/lib/email.ts](src/lib/email.ts)). Bookings are always presented to the user as "pending confirmation", never as confirmed.
- Email goes through the Resend REST API via `fetch` when `RESEND_API_KEY` is set; otherwise it logs to console and reports success.
- `POST /api/contact` follows the same validation + honeypot pattern.

**Admin (`/admin`):** [src/lib/auth.ts](src/lib/auth.ts) implements password login (`ADMIN_PASSWORD` env, no default; in production it must be ≥10 chars and not the old demo password `RunAuto2026!`) with an HMAC-signed, expiring httpOnly cookie (`ADMIN_SESSION_SECRET`, or derived from the password), constant-time comparisons, and in-memory login rate limiting. There is no middleware/proxy: `admin/page.tsx` (server component, `force-dynamic`) calls `verifyAdminSession()` and redirects to `/admin/login`, then passes data to `AdminDashboardClient.tsx`. Each admin-only handler checks the session itself: `/api/admin/toggle-date`, `/api/appointments/[id]`, and the `GET` handlers of `/api/appointments` and `/api/contact` (their `POST` handlers are public).

**Styling:** "Racing Light" theme — color tokens defined in `:root` and mapped via `@theme inline` in [src/app/globals.css](src/app/globals.css) (`blanc`, `glacier`, `aluminium`, `racing`, `carbone`, `technique`, `e85`…). Use these Tailwind tokens rather than raw hex. The README's dark "luxury" palette is outdated. Images live in `public/images/`; when replacing an image, use a new filename (e.g. `-light.jpg` suffix) to bust the Next.js image cache.

## Environment

Copy `.env.example` to `.env.local`. Relevant vars: `ADMIN_PASSWORD` (required for admin), `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (required in production), `RESEND_API_KEY`, `EMAIL_FROM` (defaults to `onboarding@resend.dev` until a domain is verified), `GARAGE_NOTIFICATION_EMAIL` (garage alert for each booking). Slot "today" logic uses Europe/Paris time, not server time.

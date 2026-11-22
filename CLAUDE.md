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

**Source de données dynamique : l'administration (`/admin`) via [src/lib/siteData.ts](src/lib/siteData.ts) → `getSiteData()`.**
- Toutes les pages publiques (`layout.tsx`, `page.tsx`, `prestations`, `prestations/[slug]`, `prendre-rendez-vous`, `le-garage`, `contact`, `faq`, `mentions-legales`, `politique-confidentialite`, `sitemap.ts`), les composants et l'API de réservation (`POST /api/appointments`) lisent `getSiteData()` (mis en cache via `unstable_cache` avec le tag `SITE_TAG = "site"`, invalidé immédiatement par `updateTag(SITE_TAG)` + `revalidatePath(...)` dans `invalidateSite()` de `src/lib/actions/admin.ts`).
- [src/config/garage.ts](src/config/garage.ts) (`GARAGE_CONFIG`) sert uniquement de **valeurs par défaut** au premier lancement (base vide), de contenus éditoriaux enrichis par slug, et d'**informations légales** fixes (SIREN, SIRET, TVA, hébergeur, sous-traitants).

**Persistence: [src/lib/storage.ts](src/lib/storage.ts)** — async store with two backends. When `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` are set, it uses Supabase (tables from `supabase/schema.sql` : `appointments`, `contact_messages`, `blocked_dates`, `site_settings`, `admin_credentials`, `rate_limits`, RLS on with no public policies). La capacité des ponts (`settings.slotCapacity`) est garantie atomiquement par les fonctions SQL `book_appointment(...)` et `update_appointment_status_checked(...)` avec `pg_advisory_xact_lock`. Les photos envoyées depuis l'admin sont stockées dans le bucket privé `uploads` de Supabase Storage (ou `data/uploads` en local) et servies via `/api/uploads/[name]`. Without Supabase vars it falls back to `data/storage.json` (dev only); on Vercel (`VERCEL` env set) it refuses to run without Supabase.

**Booking & Cron flow:**
- [src/lib/availability.ts](src/lib/availability.ts) generates 60-min slots from the live admin `hours`, `closures`, `slotCapacity`, `bookingLeadHours` and `onlineBookingEnabled`.
- `GET /api/slots` exposes availability to [src/components/BookingWizard.tsx](src/components/BookingWizard.tsx).
- `POST /api/appointments` validates `serviceId` against active admin services (`getSiteData().services`), rejects hidden services, checks Turnstile/honeypot/rate-limit, re-checks `isSlotAvailable`, books atomically via `storage.createAppointment`, and calls `sendAppointmentNotifications` ([src/lib/email.ts](src/lib/email.ts)).
- `GET /api/cron/reminders` (protégé par `Authorization: Bearer ${CRON_SECRET}`, déclenché par `vercel.json` à `0 17 * * *` UTC) envoie les rappels e-mail aux RDV `confirmed` du lendemain (heure de Paris) et renseigne `reminder_sent_at`.
- `POST /api/contact` follows the same validation + honeypot + Turnstile pattern.

**Admin (`/admin`):** [src/lib/auth.ts](src/lib/auth.ts) utilise `ADMIN_PASSWORD` (env) au premier démarrage, puis le mot de passe chiffré en bcrypt dans la table `admin_credentials` dès qu'il est modifié depuis la section « Sécurité » de `/admin`. Les sessions sont des jetons HMAC-SHA256 httpOnly portant une `session_version` : changer le mot de passe invalide immédiatement toutes les autres sessions. Les mutations passent par des Server Actions dans [src/lib/actions/admin.ts](src/lib/actions/admin.ts) (toutes protégées par `requireAdmin()` en première ligne, validation `https://` et bornes numériques). L'export CSV protégé est servi par `GET /api/admin/export` (séparateur `;`, BOM UTF-8, protection injection de formules).

**Styling:** "Racing Light" theme — color tokens defined in `:root` and mapped via `@theme inline` in [src/app/globals.css](src/app/globals.css) (`blanc`, `glacier`, `aluminium`, `racing`, `carbone`, `technique`, `e85`…). Use these Tailwind tokens rather than raw hex.

## Environment

Copy `.env.example` to `.env.local`. Relevant vars: `ADMIN_PASSWORD` (initial admin password), `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (required in production), `RESEND_API_KEY`, `EMAIL_FROM`, `GARAGE_NOTIFICATION_EMAIL`, `CRON_SECRET` (for `/api/cron/reminders`), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`. Slot "today" and reminder "tomorrow" logic use Europe/Paris time.

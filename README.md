# Elisha & Olivia — Wedding Website

Single-page wedding site with invitation route and admin panel.

**Events**
- Traditional wedding — 12 December 2026 — Abidjan, Ivory Coast — time TBC
- White wedding — 19 December 2026 — 12:00 PM — Cape Coast, Ghana

## Stack

Next.js (App Router) · Tailwind · Supabase · Paystack (GHS) · Resend · Vercel

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

1. Create a Supabase project and paste keys into `.env.local`.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor (events, registry, RSVPs, admin_users, moments media types, storage).
3. Enable Google Auth; redirect to `http://localhost:3000/admin`.
4. Primary admin is seeded as `elishaatosagoe@gmail.com` — invite others from **Admin → Admins**.

## Public routes

| Path | Description |
|------|-------------|
| `/` | Long-scroll: Welcome, Story, RSVP, Registry, Moments |
| `/invitation` | Shareable formal invitation (WhatsApp-friendly) |
| `/admin` | Google-auth admin panel |

Old paths `/story`, `/registry`, `/moments` redirect to the matching anchors.

## Palette

Theme tokens: `wedding-blue` `#06B3F8`, `wedding-brown` `#E3D3BC`, `wedding-gold` `#EACA67`, `wedding-white` `#EDEFEE`.

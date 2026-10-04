# Changelog

All notable changes to the Eli & Olivia Wedding Website project are documented in this file.

## [1.2.0] - 2026-10-04

### Added
- **API Endpoint `/api/admin/contributions`**: Created server-side API route utilizing `createAdminClient` service role to securely query contributions from Supabase for the admin panel.

### Changed
- **Admin Panel Data Persistence**:
  - Updated `/api/goals` to sanitize mock IDs (`goal-*`) preventing Postgres UUID syntax errors on upsert and delete operations.
  - Updated `/api/goals`, `/api/categories`, `/api/moments`, and `/api/content` handlers to safely wrap Supabase operations in `isSupabaseConfigured()`, ensuring state persistence when database credentials are standard and safe fallbacks when unconfigured.
  - Updated `AdminContributionsPage` (`/admin/contributions`) to fetch live ledger data via `/api/admin/contributions` and `/api/goals`.
- **Live Web App Integration & Content Management**:
  - Verified Content Management (`/admin/content` & `/api/content`): full support for home hero slideshow photos, story photos, custom MP4/YouTube videos, desktop/mobile focal positioning (`object_position`), mobile image overrides, sorting, and image uploads.
  - Updated `InvitationContent` (`/invitation` page) to fetch live event updates from `/api/events`, ensuring venue edits, dates, times, and GPS links persist and display on the digital invitation.
  - Updated default story section image positioning in `DEFAULT_SITE_MEDIA` for clean framing across mobile and desktop displays.

## [1.1.0] - 2026-10-02

### Added
- Created `CHANGELOG.md` to track project release updates and feature modifications.
- Added WebP optimized image assets (`.webp`) to `public/hero/`.

### Changed
- **Port Configuration**: Updated `package.json` `dev` script to run on port 3001 (`next dev -p 3001`).
- **Event Time Update**: Updated Traditional Wedding time (Saturday, December 12) from `null` to `12:00` (12:00 PM) in `lib/site-config.ts` and `supabase/schema.sql`.
- **Invitation Wording Correction**:
  - **English**:
    - Header: `"The Sagoe and Tokpa Families"`
    - Connector: `"And"` ("Olivia Eunice Tokpa And Elisha Austin Sagoe")
    - Text: `"request the honor of your presence at their wedding celebrations"`
  - **French**:
    - Header: `"Les familles Sagoe et Tokpa"`
    - Connector: `"Et"` ("Olivia Eunice Tokpa Et Elisha Austin Sagoe")
    - Text: `"sollicitent l'honneur de votre présence à leurs célébrations de mariage"`
- **Image Performance**: Updated image sources across `HeroSlideshow.tsx`, `StorySection.tsx`, `mockData.ts`, and `app/api/content/route.ts` to utilize WebP formats.
- **API Guard**: Added `isSupabaseConfigured()` checks in `/api/events` and `/api/content` routes to gracefully return site config fallbacks when Supabase environment variables are unconfigured.

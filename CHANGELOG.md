# Changelog

All notable changes to the Eli & Olivia Wedding Website project are documented in this file.

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

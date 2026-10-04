# Changelog

All notable changes to the Eli & Olivia Wedding Website project are documented in this file.

## [1.4.0] - 2026-10-04

### Fixed
- **Registry Goal Duplication on Edit**:
  - Identified root cause in `app/api/goals/route.ts`: legacy mock string checks (`id.startsWith('goal-')`) stripped IDs during goal edits, causing Supabase Postgres to treat updates as new inserts and generate duplicate goal rows.
  - Replaced prefix checks with strict UUID validation (`isUuid(id)`).
  - Updated all mock categories, goals, and moments in `lib/mockData.ts` to use valid UUID strings.
  - Updated `app/admin/goals/page.tsx` to generate client-side UUIDs (`crypto.randomUUID()`) for new goals and preserve existing goal IDs during edits, ensuring clean in-place updates.
- **Broken Goal Images & Remote Hosts**:
  - Updated `next.config.ts` `remotePatterns` with wildcard domain rules (`hostname: '**'`) for `http` and `https` protocols, allowing arbitrary external web image URLs to optimize and render without Next.js domain block errors.
  - Added `onError` fallback handling in `components/registry/GoalCard.tsx` and `app/admin/goals/page.tsx` to display clean placeholders if an external image URL fails to load.
- **Goal Deletion Persistence**:
  - Removed strict pattern enforcement on `DELETE /api/goals` and `DELETE /api/categories`.
  - Admin deletion requests now execute `supabase.from('goals').delete().eq('id', id)` unconditionally for any ID string (including legacy string IDs like `"goal-1788809645793"` / `"Our Hme"`), ensuring deleted items are permanently removed from the Supabase database.

## [1.3.0] - 2026-10-04

### Fixed
- **HAR Network Dump Inspection (`seguamour.com.har`)**:
  - Analyzed complete browser network trace (`seguamour.com.har`) containing 144 requests.
  - **Issue 1 (`POST /api/events` - Status 500)**: Resolved schema error (`Could not find the 'attendanceKey' column of 'site_events' in the schema cache`) by implementing bidirectional column mappers (`dbRowToWeddingEvent` and `weddingEventToDbRow`) in `app/api/events/route.ts` to convert camelCase frontend properties to Postgres snake_case columns.
  - **Issue 2 (`POST /api/upload` - Status 500 & 400)**: Resolved Supabase Storage error (`Bucket not found`) in `app/api/upload/route.ts` by adding automatic public bucket creation (`createBucket(bucket, { public: true })`) with retry logic, as well as a local disk fallback (`.data/uploads/` -> `/api/uploads/[filename]`) to ensure uploads succeed under all environment conditions.

### Changed
- **Google SSO Hardening**: Added explicit pre-flight environment checks in `app/admin/login/page.tsx` to alert admins if Supabase URL credentials are not set before initiating Google OAuth flow.

## [1.2.0] - 2026-10-04

### Added
- **API Endpoint `/api/admin/contributions`**: Created server-side API route utilizing `createAdminClient` service role to securely query contributions from Supabase for the admin panel.

### Changed
- **Admin Panel Data Persistence**:
  - Updated `/api/goals` to sanitize mock IDs (`goal-*`) preventing Postgres UUID syntax errors on upsert and delete operations.
  - Updated `/api/goals`, `/api/categories`, `/api/moments`, and `/api/content` handlers to safely wrap Supabase operations in `isSupabaseConfigured()`, ensuring state persistence when database credentials are standard and safe fallbacks when unconfigured.
  - Updated `AdminContributionsPage` (`/admin/contributions`) to fetch live ledger data via `/api/admin/contributions` and `/api/goals`.
- **Production Readiness & Security Hardening**:
  - Polished Admin Login Portal (`/admin/login`): removed debug bypass buttons and UI passcode hints for production readiness.
  - Verified Next.js 16 production build (`npm run build`) — cleanly compiled 33 static & dynamic routes with 0 errors.

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

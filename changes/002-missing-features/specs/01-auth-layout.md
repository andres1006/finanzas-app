# Specification: Refactor App Router & Auth State

## Goal
Consolidate the application layout under `/dashboard` and implement a solid authentication state across the entire app so sub-routes (`/dashboard/analisis`, etc.) can access the current user and layout without duplication.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Unauthenticated User**
- **GIVEN** a user visits `/` or any `/dashboard` route without a cookie/local session.
- **WHEN** the page loads.
- **THEN** they must be redirected to a dedicated `/login` page.

**Scenario 2: Authenticated User Login**
- **GIVEN** a user is on `/login`.
- **WHEN** they select 'Andrés' or 'Mariana'.
- **THEN** their session is saved in an app-wide context (and cookie) and they are redirected to `/dashboard`.

**Scenario 3: Unified Layout**
- **GIVEN** an authenticated user is navigating the app.
- **WHEN** they click between `/dashboard` and `/dashboard/metas`.
- **THEN** the sidebar and header should remain mounted without unmounting, taking advantage of Next.js `layout.tsx` nested structures.

# Specification: Smart Caching & Background Sync

## Goal
Minimize API calls and prevent full page reloads by using a sophisticated caching layer.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Background Revalidation**
- **GIVEN** a user is navigating between "Dashboard" and "Metas".
- **WHEN** they switch tabs.
- **THEN** show the previously cached data instantly.
- **AND** trigger a silent background fetch to see if there are new updates from Google Sheets.

**Scenario 2: Partial Component Refresh**
- **GIVEN** an update to a saving goal.
- **WHEN** the update is sent.
- **THEN** only the "Metas" component and the "Total Balance" card should refresh their visual state, leaving the rest of the layout untouched.

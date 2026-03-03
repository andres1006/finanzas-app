# Specification: Savings Goals (Metas)

## Goal
Allow users to create, view, and update savings goals (e.g., "Car", "Vacation") and track their progress via Google Sheets (`Metas_DB`).

## Data Model (Metas_DB)
| ID | Nombre | Objetivo | Actual | Fecha Limite | Usuario |

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Fetching Goals**
- **GIVEN** a user opens `/dashboard/metas`.
- **WHEN** the component mounts.
- **THEN** it fetches all rows from the `Metas_DB` tab for the current user and displays progress bars for each.

**Scenario 2: Creating a Goal**
- **GIVEN** a user clicks "Nueva Meta".
- **WHEN** they submit the form with `Nombre`, `Objetivo`, and `Fecha Limite`.
- **THEN** a new row is appended to `Metas_DB` and the UI updates immediately.

**Scenario 3: Adding Funds to a Goal**
- **GIVEN** an existing goal.
- **WHEN** the user inputs an amount to add and clicks save.
- **THEN** the `Actual` column in `Metas_DB` is updated, and a corresponding "Abono Meta" transaction is optionally registered in `Transacciones_DB` to balance cash flow.

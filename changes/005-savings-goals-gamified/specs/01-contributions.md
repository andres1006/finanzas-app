# Specification: Goal Contributions & History

## Goal
Track every single addition of money to a specific goal to ensure full transparency and historical record.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Adding money to a goal**
- **GIVEN** a user selects a goal like "Casa Propia".
- **WHEN** they input 1,000,000 COP and click "Ahorrar".
- **THEN** the system must:
    1. Update the `Actual` amount in the `Metas_DB` tab.
    2. Register a record in a new `Ahorros_Historial_DB` (or similar) with the Goal ID, Amount, and Date.

**Scenario 2: Viewing aggregation history**
- **GIVEN** the detail view of a goal.
- **WHEN** the user opens the "Historial" tab.
- **THEN** show a list: "Marzo 03, 2026: +$1.000.000", "Febrero 15, 2026: +$500.000", etc.

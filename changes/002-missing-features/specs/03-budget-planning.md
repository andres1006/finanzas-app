# Specification: Budget Planning (Planeación)

## Goal
Enable users to set monthly budget limits per category and compare them against actual spending in real-time.

## Data Model (Presupuestos_DB)
| ID | Mes_Anio | Categoria | Presupuesto | Usuario |

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Viewing Budget vs Actual**
- **GIVEN** a user opens `/dashboard/planeacion`.
- **WHEN** the component loads for the current month.
- **THEN** it fetches `Presupuestos_DB` limits and aggregates current month expenses from `Transacciones_DB` to show the % consumed per category.

**Scenario 2: Setting a Budget Limit**
- **GIVEN** the budget planner table.
- **WHEN** the user inputs a new amount for a category and saves.
- **THEN** the `Presupuestos_DB` is updated (or a new row is created if it didn't exist for that month/category) and the visual progress bar recalculates.

**Scenario 3: Over-budget Warning**
- **GIVEN** the user has spent 1,200,000 COP on "Alimentación" but the budget is 1,000,000 COP.
- **WHEN** the budget chart renders.
- **THEN** that specific category bar turns red (shadcn `destructive` color) to indicate a budget overflow.

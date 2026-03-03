# Proposal: Implement Missing Features (Auth, Goals, Budgets, Credits)

## Goal
Now that the project analysis is complete, we need to implement the core modules that are visually present in the UI but lack full functionality and data integration: Authentication/State, Savings Goals (Metas), Budget Planning (Planeación), and Credits Management (Créditos).

## Scope
1. **Global Auth & Layout**: Implement a unified React Context for session management across the `/dashboard` routes.
2. **Savings Goals (Metas)**: Connect `SavingsGoals.tsx` to a new Google Sheets tab `Metas_DB`.
3. **Budget Planning (Planeación)**: Connect `BudgetPlanner.tsx` to a new Google Sheets tab `Presupuestos_DB`.
4. **Credits (Créditos)**: Connect `CreditsManager.tsx` to a new Google Sheets tab `Creditos_DB` and refine the Snowball method.

## Context
These features exist as UI components (`/components/`) but are not hooked up to a real data layer or global state. We need to define their behavior (Specs) before writing the integration code.

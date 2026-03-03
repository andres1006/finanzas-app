# Tasks: 002 Missing Features Implementation

## Phase 1: Definition (OpenSpec)
- [x] 1. Create `proposal.md` for the missing features.
- [x] 2. Write Spec for **Global Auth & Layout** (`specs/01-auth-layout.md`).
- [x] 3. Write Spec for **Savings Goals** (`specs/02-savings-goals.md`).
- [x] 4. Write Spec for **Budget Planning** (`specs/03-budget-planning.md`).
- [x] 5. Write Spec for **Credits & Snowball Method** (`specs/04-credits.md`).

## Phase 2: Google Sheets Setup
- [ ] 6. Create `Metas_DB` tab in Google Sheets.
- [ ] 7. Create `Presupuestos_DB` tab in Google Sheets.
- [ ] 8. Create `Creditos_DB` tab in Google Sheets.
- [ ] 9. Update `/lib/googleSheets.ts` and models to fetch/write to these new tabs.

## Phase 3: Integration
- [ ] 10. Refactor `/app` to use a Global Auth Provider.
- [ ] 11. Wire `SavingsGoals.tsx` to `Metas_DB` data.
- [ ] 12. Wire `BudgetPlanner.tsx` to `Presupuestos_DB` data.
- [ ] 13. Wire `CreditsManager.tsx` to `Creditos_DB` data.

## Phase 4: Final QA
- [ ] 14. Verify full navigation works without layout flashes.
- [ ] 15. Verify data saves and loads from Google Sheets correctly.

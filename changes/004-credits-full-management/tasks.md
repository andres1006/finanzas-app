# Tasks: 004 Full Credits Management

## Phase 1: Definition (OpenSpec)
- [x] 1. Create `proposal.md` for credits management.
- [x] 2. Write Spec for **Abonos & History** (`specs/01-payments-history.md`).
- [x] 3. Write Spec for **Debt Projections** (`specs/02-debt-projections.md`).

## Phase 2: Logic Implementation
- [ ] 4. Update `googleSheets.ts` to fetch payments related to specific credits.
- [ ] 5. Implement `recalculateDebtBalance` logic in `financeUtils.ts`.

## Phase 3: UI Implementation
- [ ] 6. Refactor `CreditsManager.tsx` to add "Register Payment" button and modal.
- [ ] 7. Add "History" view for each credit card/loan.
- [ ] 8. Implement the "Debt-free Countdown" timer/visualizer.

## Phase 4: Final QA
- [ ] 9. Verify that a payment in Credits also creates a transaction in the main ledger.

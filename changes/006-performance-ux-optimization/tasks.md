# Tasks: 006 Performance & UX Optimization

## Phase 1: Definition (OpenSpec)
- [x] 1. Create `proposal.md` for performance.
- [x] 2. Write Spec for **Optimistic UI & Instant Feedback** (`specs/01-optimistic-ui.md`).
- [x] 3. Write Spec for **Smart Caching & Background Sync** (`specs/02-smart-caching.md`).

## Phase 2: Core Infrastructure
- [ ] 4. Install and configure `swr` or `react-query`.
- [ ] 5. Implement a global `useFinanceData` hook to centralize fetching.

## Phase 3: UX Refactor
- [ ] 6. Update `TransactionForm` to use optimistic updates.
- [ ] 7. Update `CreditsManager` and `SavingsGoals` to use optimistic updates for payments/contributions.
- [ ] 8. Implement skeleton loaders for initial page load.

## Phase 4: Final QA
- [ ] 9. Verify the "Perceived Speed" is under 100ms for user actions.

## ADDED Requirements

### Requirement: Budget Planning View
The system SHALL provide a view to manage the current and future monthly budget plans.

#### Scenario: Confirm Recurring Expense Payment
- **WHEN** the user marks a planned recurring expense as "Paid"
- **THEN** the system SHALL record a transaction for that expense and mark it as completed in the plan.

#### Scenario: Edit Plan Item Amount
- **WHEN** a recurring expense is auto-loaded (e.g., Electricity) and the actual bill amount differs from the estimate
- **THEN** the user SHALL be able to update the amount before marking it as paid.

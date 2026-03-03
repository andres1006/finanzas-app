# Specification: Debt Projections

## Goal
Predict when a debt will be fully paid off based on payment velocity.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Payoff Date Projection**
- **GIVEN** a debt of $10.000.000 with a monthly payment of $1.000.000.
- **WHEN** the user adds an "Extra Payment" (Snowball) of $500.000.
- **THEN** the system should update the "Projected End Date" showing how many months are saved compared to just paying the minimum.

**Scenario 2: Total Interest Visualization**
- **GIVEN** the current interest rate of the credit.
- **WHEN** looking at the projections.
- **THEN** show a "Money Saved" counter indicating how much interest is avoided by making extra payments.

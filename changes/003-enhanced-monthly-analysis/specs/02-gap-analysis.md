# Specification: Gap Analysis & Goals Tracking

## Goal
Provide a clear view of the "Gap" between current assets and monthly financial commitments or goals.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Savings Gap**
- **GIVEN** a monthly savings goal of 1,000,000 COP.
- **WHEN** the user has only registered 400,000 COP in savings transactions so far.
- **THEN** show a progress bar indicating: "You are 600,000 COP away from your goal (40% complete)".

**Scenario 2: Liquidity Status**
- **GIVEN** current balance and upcoming fixed expenses.
- **WHEN** analyzing "Financial Health".
- **THEN** display how many days the current balance would last if no more income is received (Runway).

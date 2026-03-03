# Specification: Financial Projections & Velocity

## Goal
Predict the financial state at the end of the month based on current spending patterns.

## Logic
- **Daily Average Spending**: `Current Month Expenses / Days Elapsed`.
- **Projected Total Expenses**: `Daily Average * Remaining Days + Current Expenses`.
- **Projected Balance**: `Total Estimated Income - Projected Total Expenses`.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: End-of-month projection**
- **GIVEN** the user is on the Analysis page on the 15th of the month.
- **WHEN** the dashboard renders.
- **THEN** it should show a card stating: "Based on your current spending of X per day, you will end the month spending Y total."

**Scenario 2: Warning on overspending**
- **GIVEN** the Projected Total Expenses exceed the Monthly Budget.
- **WHEN** the projection is calculated.
- **THEN** show a "Critical Warning" UI element suggesting a spending reduction.

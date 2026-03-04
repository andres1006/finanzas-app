# Specification: Gamification & Milestones

## Goal
Motivate users by providing visual rewards (medals/awards) when financial milestones are reached.

## Rules
- **Bronze Medal**: Reached 25% of the goal.
- **Silver Medal**: Reached 50% of the goal.
- **Gold Medal**: Reached 75% of the goal.
- **Platinum Trophy**: Reached 100% of the goal.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Milestone achieved**
- **GIVEN** a goal of 40,000,000 COP with a current balance of 19,000,000 COP.
- **WHEN** the user adds 1,000,000 COP (reaching 20M, which is 50%).
- **THEN** display a celebratory animation and unlock the "Silver Medal" in the goal's card.

**Scenario 2: Visual progress**
- **GIVEN** the goals list.
- **WHEN** rendering a card.
- **THEN** display small icons for the medals already earned, showing what's left to achieve the next one.

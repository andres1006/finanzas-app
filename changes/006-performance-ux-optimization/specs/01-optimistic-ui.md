# Specification: Optimistic UI & Instant Feedback

## Goal
The user should never see a loading spinner after performing an action (adding/deleting). The UI must update as if the action was successful immediately.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Adding a transaction**
- **GIVEN** a user clicks "Registrar" on a new expense.
- **WHEN** the form is submitted.
- **THEN** immediately add the item to the local `transactions` list and recalculate summary cards.
- **AND** if the server subsequently fails, rollback the change and show an error toast.

**Scenario 2: Transparent Deletion**
- **GIVEN** a user clicks "Eliminar".
- **WHEN** the action is confirmed.
- **THEN** the row must disappear instantly from the table without waiting for the Google Sheets API.

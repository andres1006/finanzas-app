# Specification: Abonos & History

## Goal
Enable users to register payments directly to a credit and see a clear history of how the debt has decreased.

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Registering a payment**
- **GIVEN** a user selects a specific credit (e.g., "Tarjeta de Crédito Visa").
- **WHEN** they click "Registrar Abono" and enter an amount of $500.000.
- **THEN** the system must:
    1. Subtract the amount from the current balance of that credit in `Creditos_DB`.
    2. Create a new transaction in `Transacciones_DB` with type "Abono Deuda" for accounting.

**Scenario 2: Viewing Payment History**
- **GIVEN** a specific credit.
- **WHEN** the user views the "Detail" section.
- **THEN** it should display a list of all transactions linked to that specific credit ID, sorted by date (newest first).

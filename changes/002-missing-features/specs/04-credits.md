# Specification: Credits & Snowball Method (Créditos)

## Goal
Manage multiple debts/credits, see the total outstanding balance, and calculate the Snowball method (Bola de Nieve) dynamically based on real data.

## Data Model (Creditos_DB)
| ID | Nombre | Saldo_Total | Tasa_Interes | Pago_Minimo | Fecha_Corte | Usuario |

## Spec: GIVEN/WHEN/THEN

**Scenario 1: Listing Active Credits**
- **GIVEN** a user opens `/dashboard/creditos`.
- **WHEN** the component mounts.
- **THEN** it fetches all active credits from `Creditos_DB` and displays them in a grid/list with their current balance and interest rate.

**Scenario 2: Applying Snowball Calculation**
- **GIVEN** the user has 3 active debts.
- **WHEN** the user inputs an "Extra Cash" amount to apply the Snowball method.
- **THEN** the system sorts the debts from lowest to highest balance, assigns the Extra Cash to the smallest debt first, and displays the optimized payoff plan.

**Scenario 3: Registering a Payment**
- **GIVEN** a credit card debt in the list.
- **WHEN** the user clicks "Pagar" and submits an amount.
- **THEN** it deducts the amount from `Saldo_Total` in `Creditos_DB` AND creates a "Gasto" (Abono Deuda) in `Transacciones_DB`.

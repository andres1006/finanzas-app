## ADDED Requirements

### Requirement: Recurring Expense Catalog
The system SHALL provide a central catalog to manage recurring expenses. Each item in the catalog MUST include:
- Concept (e.g., "Arriendo")
- Estimated Amount
- Category (e.g., "Vivienda", "Servicios")
- Suggested Day of the month (optional)

#### Scenario: Manage Catalog Items
- **WHEN** the user adds a new recurring expense to the catalog
- **THEN** the item is persisted and available for future monthly plans

#### Scenario: View Catalog
- **WHEN** the user accesses the recurring expenses management view
- **THEN** the system displays all configured recurring items

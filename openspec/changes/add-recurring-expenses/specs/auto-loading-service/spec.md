## ADDED Requirements

### Requirement: Automatic Monthly Plan Initialization
The system SHALL automatically initialize the budget plan for a month using the recurring expense catalog.

#### Scenario: Auto-load on the 29th
- **WHEN** the current date is the 29th (or later) of month $N$
- **AND** the user opens the application
- **THEN** the system SHALL ensure the budget plan for month $N+1$ exists, creating it from the recurring catalog if necessary.

#### Scenario: First Access of the Month
- **WHEN** the user opens the application in a new month $M$
- **AND** no budget plan exists for month $M$
- **THEN** the system SHALL automatically create the budget plan for month $M$ from the recurring catalog.

# Requirements Document

## Introduction

Replace the current stacked collapsible/expander-based score entry UI in the Sea Salt & Paper scoring app with a table layout. The table uses a left column for card type labels and one column per player for entering card counts. This is a UI-only change; the underlying types, scoring engine, game store, and persistence remain unchanged.

## Glossary

- **Score_Entry_Screen**: The screen (`app/score-entry.tsx`) where users enter card breakdowns for each player during a round.
- **Score_Table**: The new table-based layout component that replaces the collapsible section UI for entering card breakdowns.
- **Label_Column**: The leftmost column of the Score_Table, displaying the card type name for each row.
- **Player_Column**: A column in the Score_Table corresponding to a single player, containing numeric inputs for that player's card counts.
- **Category_Header_Row**: A row in the Score_Table that spans all columns and displays a card category name (Duo Cards, Collector Cards, Mermaids) to visually group related card type rows.
- **Multiplier_Toggle**: An inline boolean toggle control associated with a card type row (boats, fish, penguins, sailors) that activates the multiplier bonus for that card type for a given player.
- **Mermaid_Count_Row**: A row in the Score_Table for entering the number of mermaids each player holds.
- **Mermaid_Color_Row**: A dynamically rendered row in the Score_Table for entering the color count of a specific mermaid for each player.
- **Player_Score_Footer**: A row at the bottom of the Score_Table displaying each player's computed card score.

## Requirements

### Requirement 1: Table Layout Structure

**User Story:** As a user, I want to see all card types and all players in a single table, so that I can enter scores faster without expanding and collapsing sections.

#### Acceptance Criteria

1. THE Score_Table SHALL render a Label_Column as the first column and one Player_Column for each player in the game session.
2. THE Score_Table SHALL display player names as column headers above each Player_Column.
3. THE Score_Table SHALL render one row per card type in the following order: Crabs, Boats, Fish, Swimmer+Shark Combos, Shells, Octopus, Penguins, Sailors, Mermaid Count.
4. THE Score_Table SHALL display Category_Header_Row entries for "Duo Cards", "Collector Cards", and "Mermaids" above their respective groups of card type rows.
5. THE Score_Table SHALL support 2 to 4 Player_Columns based on the number of players in the active game session.

### Requirement 2: Numeric Input Cells

**User Story:** As a user, I want each cell in the table to accept numeric input, so that I can enter card counts for each player per card type.

#### Acceptance Criteria

1. WHEN a user taps a cell in a Player_Column, THE Score_Table SHALL present a numeric keyboard for input.
2. THE Score_Table SHALL display "0" as the placeholder value for empty numeric input cells.
3. WHEN a user enters a value in a numeric input cell, THE Score_Entry_Screen SHALL update the corresponding field in the player's CardBreakdown.
4. WHEN a user leaves a numeric input cell with an empty or non-numeric value, THE Score_Table SHALL normalize the displayed value to "0".

### Requirement 3: Multiplier Toggles

**User Story:** As a user, I want to toggle multiplier bonuses inline within the table, so that I can activate multipliers without leaving the table flow.

#### Acceptance Criteria

1. THE Score_Table SHALL display a Multiplier_Toggle adjacent to or within each numeric input cell for Boats, Fish, Penguins, and Sailors rows.
2. WHEN a user activates a Multiplier_Toggle for a player, THE Score_Entry_Screen SHALL set the corresponding multiplier field to true in that player's CardBreakdown.
3. WHEN a user deactivates a Multiplier_Toggle for a player, THE Score_Entry_Screen SHALL set the corresponding multiplier field to false in that player's CardBreakdown.
4. THE Multiplier_Toggle SHALL visually distinguish between active and inactive states.

### Requirement 4: Mermaid Dynamic Rows

**User Story:** As a user, I want mermaid color count rows to appear dynamically based on the mermaid count I enter, so that I only see relevant inputs.

#### Acceptance Criteria

1. WHEN a user enters a mermaid count greater than 0 for a player, THE Score_Table SHALL render one Mermaid_Color_Row for each mermaid (up to 4) below the Mermaid_Count_Row.
2. THE Score_Table SHALL render Mermaid_Color_Row entries per player independently, based on each player's individual mermaid count.
3. WHEN a user enters a mermaid count of 4 for a player, THE Score_Entry_Screen SHALL trigger the mermaid instant win confirmation prompt.
4. WHEN a user decreases the mermaid count, THE Score_Table SHALL remove excess Mermaid_Color_Row entries from the bottom.

### Requirement 5: Player Score Footer

**User Story:** As a user, I want to see each player's computed card score at the bottom of the table, so that I can verify totals before submitting.

#### Acceptance Criteria

1. THE Score_Table SHALL display a Player_Score_Footer row showing the computed card score for each player.
2. WHEN any input value changes, THE Player_Score_Footer SHALL update the displayed score in real time using the existing calculateCardScore function.

### Requirement 6: Validation Display

**User Story:** As a user, I want to see validation errors clearly associated with the relevant player, so that I can correct invalid entries.

#### Acceptance Criteria

1. WHEN a submission is attempted with invalid card breakdown values, THE Score_Entry_Screen SHALL display validation errors for each player with errors.
2. THE Score_Entry_Screen SHALL display validation errors near the corresponding Player_Column or below the Score_Table, clearly associated with the player name.

### Requirement 7: Horizontal Scrolling for Many Players

**User Story:** As a user with 4 players, I want the table to remain usable on narrow screens, so that I can still enter scores comfortably.

#### Acceptance Criteria

1. WHILE the Score_Table width exceeds the available screen width, THE Score_Table SHALL enable horizontal scrolling.
2. WHILE the user scrolls horizontally, THE Label_Column SHALL remain fixed and visible on the left side of the screen.

### Requirement 8: Preserve Existing Behavior

**User Story:** As a user, I want the table UI to work identically with the existing round submission, Last Chance flow, and scoring logic, so that no game functionality changes.

#### Acceptance Criteria

1. THE Score_Entry_Screen SHALL continue to use the existing CardBreakdown, PlayerCardBreakdown, and MultiplierCards types from src/types.ts without modification.
2. THE Score_Entry_Screen SHALL continue to use the existing calculateCardScore and validateCardBreakdown functions from src/scoringEngine.ts without modification.
3. THE Score_Entry_Screen SHALL continue to use the existing submitRound and declareMermaidWin functions from the game store without modification.
4. THE Score_Entry_Screen SHALL preserve the existing Round End Type selector (Stop, Last Chance, Empty Deck) and Last Chance multi-step flow unchanged.

# Requirements Document

## Introduction

The score entry screen (`app/score-entry.tsx`) is currently a single monolithic screen that handles all three round end types (Stop, Last Chance, Empty Deck) with conditional rendering and inline state management. This feature refactors the screen into a multi-step wizard flow where Step 1 always asks the user to select the round end type, and Step 2 branches into the appropriate sub-flow depending on the selection. The goal is improved clarity, reduced cognitive load, and a more natural user experience.

## Glossary

- **Wizard**: A multi-step UI flow that guides the user through a sequence of screens within the score entry process.
- **Wizard_Step**: A single screen or view within the Wizard, identified by a step number and purpose.
- **Round_End_Type_Selector**: The first Wizard_Step, presenting the three round end type options (Stop, Last Chance, Empty Deck).
- **Score_Entry_Screen**: The Expo Router screen at `app/score-entry.tsx` that hosts the Wizard.
- **ScoreTable**: The existing component (`src/components/ScoreTable.tsx`) used for entering card breakdowns per player.
- **Stop_Flow**: The sub-flow for the "Stop" round end type, consisting of the ScoreTable and a submit button.
- **Last_Chance_Flow**: The multi-step sub-flow for the "Last Chance" round end type: select caller → enter breakdowns → determine outcome → enter color bonuses → submit.
- **Empty_Deck_Flow**: The sub-flow for the "Empty Deck" round end type, showing a message that no scores are counted and navigating back to the scoreboard.
- **Caller**: The player who called "Last Chance" during a round.
- **Color_Bonus**: A bonus score derived from the count of a player's most-held card color, entered during the Last_Chance_Flow.
- **Game_Store**: The Zustand store (`src/store/gameStore.ts`) managing game session state.

## Requirements

### Requirement 1: Wizard Step 1 — Round End Type Selection

**User Story:** As a player, I want to select the round end type as the first step of score entry, so that the subsequent flow is tailored to the type of round that just ended.

#### Acceptance Criteria

1. WHEN the Score_Entry_Screen is opened, THE Round_End_Type_Selector SHALL display three options: "Stop", "Last Chance", and "Empty Deck".
2. WHEN a player selects a round end type on the Round_End_Type_Selector, THE Wizard SHALL advance to the corresponding sub-flow for that type.
3. THE Round_End_Type_Selector SHALL display the current round number as a title.
4. THE Round_End_Type_Selector SHALL present each option as a distinct, tappable button with the label matching the round end type name.

### Requirement 2: Stop Flow

**User Story:** As a player, I want to enter card breakdowns and submit the round when the round ended with "Stop", so that scores are recorded correctly.

#### Acceptance Criteria

1. WHEN the player selects "Stop" on the Round_End_Type_Selector, THE Stop_Flow SHALL display the ScoreTable for entering card breakdowns for all players.
2. THE Stop_Flow SHALL display a "Submit Round" button below the ScoreTable.
3. WHEN the player presses "Submit Round" in the Stop_Flow, THE Score_Entry_Screen SHALL validate all card breakdowns using the existing validation logic before submitting.
4. IF validation fails during the Stop_Flow submission, THEN THE Score_Entry_Screen SHALL display the validation errors and remain on the current step.
5. WHEN validation succeeds during the Stop_Flow submission, THE Score_Entry_Screen SHALL submit the round scores to the Game_Store and navigate to the scoreboard or game-over screen based on the result.
6. THE Stop_Flow SHALL allow the player to navigate back to the Round_End_Type_Selector to change the round end type selection.

### Requirement 3: Last Chance Flow

**User Story:** As a player, I want to follow a guided multi-step process when the round ended with "Last Chance", so that the caller selection, score entry, outcome determination, and color bonuses are handled in a clear sequence.

#### Acceptance Criteria

1. WHEN the player selects "Last Chance" on the Round_End_Type_Selector, THE Last_Chance_Flow SHALL begin at the "Select Caller" sub-step.
2. WHEN the "Select Caller" sub-step is displayed, THE Last_Chance_Flow SHALL show a button for each player in the game session, allowing the user to designate the Caller.
3. WHEN a Caller is selected, THE Last_Chance_Flow SHALL advance to the "Enter Breakdowns" sub-step, displaying the ScoreTable and a "Determine Outcome" button.
4. WHEN the player presses "Determine Outcome", THE Last_Chance_Flow SHALL validate all card breakdowns and, if valid, calculate the Last Chance outcome (won or lost) based on the Caller's card score versus opponents' card scores.
5. WHEN the outcome is determined, THE Last_Chance_Flow SHALL display the outcome (won or lost) with an explanation of the scoring implications, and a button to proceed to color bonus entry.
6. WHEN the player proceeds to color bonus entry, THE Last_Chance_Flow SHALL display color bonus input fields for the appropriate players based on the outcome (all players if the Caller won, only the Caller if the Caller lost).
7. WHEN the player presses "Submit Round" in the Last_Chance_Flow, THE Score_Entry_Screen SHALL validate all inputs, calculate Last Chance round scores, submit the round to the Game_Store, and navigate to the scoreboard or game-over screen based on the result.
8. THE Last_Chance_Flow SHALL display a badge indicating the selected Caller's name throughout the sub-steps after caller selection.
9. THE Last_Chance_Flow SHALL allow the player to navigate back to the Round_End_Type_Selector to change the round end type selection.

### Requirement 4: Empty Deck Flow

**User Story:** As a player, I want to see a clear message when the deck is empty and no scoring happens, so that I understand the round outcome and can return to the scoreboard.

#### Acceptance Criteria

1. WHEN the player selects "Empty Deck" on the Round_End_Type_Selector, THE Empty_Deck_Flow SHALL display a message indicating that no scores are counted for the round.
2. THE Empty_Deck_Flow SHALL display a button to return to the scoreboard.
3. WHEN the player presses the return button in the Empty_Deck_Flow, THE Score_Entry_Screen SHALL submit a round with zero scores for all players to the Game_Store and navigate to the scoreboard or game-over screen based on the result.
4. THE Empty_Deck_Flow SHALL allow the player to navigate back to the Round_End_Type_Selector to change the round end type selection.

### Requirement 5: Wizard Navigation and State Management

**User Story:** As a player, I want to navigate back to the round end type selection from any sub-flow, so that I can correct a mistaken selection without losing context.

#### Acceptance Criteria

1. WHILE a sub-flow (Stop_Flow, Last_Chance_Flow, or Empty_Deck_Flow) is active, THE Wizard SHALL provide a way to return to the Round_End_Type_Selector.
2. WHEN the player navigates back to the Round_End_Type_Selector, THE Wizard SHALL reset the sub-flow state for the previously selected round end type.
3. THE Wizard SHALL preserve the card breakdown data entered in the ScoreTable when navigating back to the Round_End_Type_Selector, so that re-entering the same sub-flow does not require re-entry of card data.
4. WHEN the Score_Entry_Screen is opened and no active game session exists in the Game_Store, THE Score_Entry_Screen SHALL redirect to the home screen.

### Requirement 6: Mermaid Instant Win Detection

**User Story:** As a player, I want the mermaid instant win detection to continue working within the wizard flow, so that a player with 4 mermaids can be declared the winner at any point during score entry.

#### Acceptance Criteria

1. WHEN a player's mermaid count reaches 4 during card breakdown entry in the Stop_Flow or Last_Chance_Flow, THE Score_Entry_Screen SHALL prompt the user to confirm a mermaid instant win.
2. WHEN the user confirms a mermaid instant win, THE Score_Entry_Screen SHALL call the Game_Store's declareMermaidWin action and navigate to the game-over screen.

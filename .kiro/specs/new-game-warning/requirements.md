# Requirements Document

## Introduction

When a player taps "New Game" while a game session is still in progress (no winner declared yet), the app should display a confirmation warning dialog. This prevents accidental loss of game progress. If the game is already over (winner exists), no warning is needed since there is no progress to lose.

## Glossary

- **Warning_Dialog**: A modal confirmation dialog that warns the player about losing progress and offers "Cancel" and "Start New Game" actions
- **Scoreboard_Screen**: The main game screen (`scoreboard.tsx`) that displays scores and contains the "New Game" button
- **Game_Session**: The persisted game state containing players, rounds, and winner status
- **In_Progress_Game**: A Game_Session where at least one player exists and no winner has been declared (`winner` is `null` and `mermaidWin` is `false`)

## Requirements

### Requirement 1: Show warning when starting new game during in-progress game

**User Story:** As a player, I want to be warned before starting a new game while my current game is still in progress, so that I do not accidentally lose my game progress.

#### Acceptance Criteria

1. WHEN the player presses "New Game" on the Scoreboard_Screen WHILE an In_Progress_Game exists, THE Scoreboard_Screen SHALL display the Warning_Dialog before resetting the game
2. WHEN the player presses "New Game" on the Scoreboard_Screen WHILE the game is over (winner declared), THE Scoreboard_Screen SHALL start a new game immediately without displaying the Warning_Dialog

### Requirement 2: Warning dialog content

**User Story:** As a player, I want the warning dialog to clearly explain what will happen, so that I can make an informed decision.

#### Acceptance Criteria

1. THE Warning_Dialog SHALL display a title indicating the current game is not finished
2. THE Warning_Dialog SHALL display a message informing the player that starting a new game will discard the current game progress
3. THE Warning_Dialog SHALL provide a "Cancel" action that dismisses the dialog and returns to the Scoreboard_Screen without changes
4. THE Warning_Dialog SHALL provide a "Start New Game" action that resets the Game_Session and navigates to the player setup screen

### Requirement 3: Warning dialog behavior

**User Story:** As a player, I want the warning dialog to behave predictably, so that I feel in control of the decision.

#### Acceptance Criteria

1. WHEN the player selects "Cancel" on the Warning_Dialog, THE Warning_Dialog SHALL close and THE Game_Session SHALL remain unchanged
2. WHEN the player selects "Start New Game" on the Warning_Dialog, THE Scoreboard_Screen SHALL call `newGame()` and navigate to the player setup screen
3. THE Warning_Dialog SHALL be accessible, with appropriate accessibility labels on both action buttons

### Requirement 4: No warning on game-over screen

**User Story:** As a player, I want to start a new game from the game-over screen without a warning, since the game is already finished.

#### Acceptance Criteria

1. WHEN the player presses "New Game" on the Game_Over_Screen, THE Game_Over_Screen SHALL start a new game immediately without displaying the Warning_Dialog

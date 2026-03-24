# Requirements Document

## Introduction

The Sea Salt & Paper Scorer app currently persists only the active game session via Zustand's `persist` middleware. When a user starts a new game, the previous game is discarded. This feature adds a game history layer so that completed (and abandoned) games are saved and browsable, and ensures that an in-progress game survives app closure and can be seamlessly resumed.

## Glossary

- **App**: The Sea Salt & Paper Scorer React Native / Expo application
- **Game_Store**: The Zustand store (`gameStore.ts`) that holds the active `GameSession` and exposes game actions
- **Game_Session**: The data structure representing a single game, including players, rounds, winner, and mermaid-win flag (type `GameSession` in `types.ts`)
- **Game_History**: An ordered collection of saved `Game_Record` entries persisted on the device
- **Game_Record**: A stored snapshot of a `Game_Session` together with metadata (unique identifier, timestamps, completion status)
- **Active_Game**: The `Game_Session` currently in progress (not yet finished or abandoned)
- **Completed_Game**: A `Game_Session` that reached a win condition (a winner was determined)
- **Abandoned_Game**: A `Game_Session` that was discarded by the user before a winner was determined (e.g. the user confirmed "Start New Game" while a game was in progress)
- **Storage_Adapter**: The platform-specific AsyncStorage (native) or localStorage (web) wrapper used by Zustand's persist middleware
- **History_Screen**: A new screen that displays the list of past games

## Requirements

### Requirement 1: Save completed games to history

**User Story:** As a player, I want completed games to be automatically saved to the game history, so that I can look back at past results.

#### Acceptance Criteria

1. WHEN a `Game_Session` reaches a win condition (winner is determined), THE Game_Store SHALL create a `Game_Record` with status "completed" and append it to the `Game_History`.
2. THE Game_Record SHALL contain a unique identifier, the full `Game_Session` data, a creation timestamp, and a completion timestamp.
3. WHEN a completed game is saved, THE Game_Store SHALL persist the updated `Game_History` to the `Storage_Adapter` within the same state update.

### Requirement 2: Save abandoned games to history

**User Story:** As a player, I want games I abandon mid-play to be saved to history, so that I do not lose the record of rounds already played.

#### Acceptance Criteria

1. WHEN the user confirms starting a new game while an `Active_Game` exists, THE Game_Store SHALL create a `Game_Record` with status "abandoned" and append it to the `Game_History` before clearing the `Active_Game`.
2. THE Game_Record for an abandoned game SHALL contain the same fields as a completed game, except the completion timestamp SHALL equal the moment of abandonment and the winner field SHALL be null.

### Requirement 3: Resume an in-progress game after app closure

**User Story:** As a player, I want to close the app mid-game and reopen it to find my game exactly where I left it, so that I do not lose progress.

#### Acceptance Criteria

1. WHILE an `Active_Game` exists, THE Game_Store SHALL persist the `Active_Game` state to the `Storage_Adapter` after every state mutation (round submission, mermaid win declaration, tie resolution).
2. WHEN the App launches and a persisted `Active_Game` is found, THE App SHALL restore the `Active_Game` and navigate the user to the scoreboard screen.
3. WHEN the App launches and no persisted `Active_Game` is found, THE App SHALL display the player setup screen.
4. IF the persisted `Active_Game` data is corrupted or fails deserialization, THEN THE App SHALL discard the corrupted data, log a warning, and display the player setup screen.

### Requirement 4: Display game history list

**User Story:** As a player, I want to see a list of my past games, so that I can review previous results.

#### Acceptance Criteria

1. THE History_Screen SHALL display all `Game_Record` entries from the `Game_History`, ordered by completion timestamp descending (most recent first).
2. THE History_Screen SHALL display for each `Game_Record`: the player names, the winner name (or "Abandoned" for abandoned games), the final scores, and the date of the game.
3. WHEN the `Game_History` is empty, THE History_Screen SHALL display a message indicating no past games exist.
4. THE App SHALL provide navigation to the History_Screen from both the player setup screen and the scoreboard screen.

### Requirement 5: View a past game's details

**User Story:** As a player, I want to tap on a past game and see its full scoreboard, so that I can review round-by-round results.

#### Acceptance Criteria

1. WHEN the user selects a `Game_Record` from the History_Screen, THE App SHALL display the full scoreboard for that game in a read-only view.
2. THE read-only scoreboard SHALL show the same round-by-round scores, totals, and round-end-type icons as the active scoreboard screen.
3. THE read-only scoreboard SHALL NOT display "Add Round" or "New Game" action buttons.

### Requirement 6: Delete a game from history

**User Story:** As a player, I want to delete individual games from my history, so that I can keep my history tidy.

#### Acceptance Criteria

1. WHEN the user requests deletion of a `Game_Record`, THE App SHALL display a confirmation prompt before deleting.
2. WHEN the user confirms deletion, THE Game_Store SHALL remove the `Game_Record` from the `Game_History` and persist the updated `Game_History` to the `Storage_Adapter`.
3. IF the user cancels deletion, THEN THE App SHALL leave the `Game_History` unchanged.

### Requirement 7: Clear entire game history

**User Story:** As a player, I want to clear all my game history at once, so that I can start fresh.

#### Acceptance Criteria

1. WHEN the user requests to clear all history, THE App SHALL display a confirmation prompt before clearing.
2. WHEN the user confirms clearing, THE Game_Store SHALL remove all `Game_Record` entries from the `Game_History` and persist the empty `Game_History` to the `Storage_Adapter`.
3. IF the user cancels clearing, THEN THE App SHALL leave the `Game_History` unchanged.

### Requirement 8: Serialization and deserialization of game history

**User Story:** As a developer, I want game history to be reliably serialized and deserialized, so that data is not lost between app sessions.

#### Acceptance Criteria

1. THE Persistence module SHALL serialize the `Game_History` (array of `Game_Record` objects) to a JSON string for storage.
2. THE Persistence module SHALL deserialize a JSON string back into a `Game_History` array.
3. FOR ALL valid `Game_History` arrays, serializing then deserializing SHALL produce an equivalent array (round-trip property).
4. IF deserialization of the `Game_History` fails, THEN THE Persistence module SHALL return an empty array and log a warning.

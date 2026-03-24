# Implementation Plan: Sea Salt and Paper Scorer

## Overview

Incremental implementation of the Sea Salt and Paper score tracking app using React Native + Expo with TypeScript. Tasks build from data models and pure logic outward to state management, persistence, and UI screens. Property-based tests (fast-check) and unit tests validate correctness at each layer.

## Tasks

- [x]   1. Initialize Expo project and install dependencies
    - Create a new Expo project with TypeScript template
    - Install dependencies: `zustand`, `@react-native-async-storage/async-storage`, `expo-router`, `fast-check` (dev), `@testing-library/react-native` (dev)
    - Configure `expo-router` for file-based navigation with 4 routes: `PlayerSetupScreen`, `ScoreboardScreen`, `ScoreEntryScreen`, `GameOverScreen`
    - Verify the app builds and runs on web
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [ ]   2. Define TypeScript data models and types
    - [x] 2.1 Create `src/types.ts` with all data model interfaces
        - Define `RoundEndType`, `PlayerInput`, `Player`, `PlayerRoundScore`, `Round`, `GameSession`, `WinResult`, `ScoreboardRow`
        - _Requirements: 3.3, 4.1, 4.3, 5.1_

- [ ]   3. Implement pure game logic module
    - [x] 3.1 Create `src/gameLogic.ts` with core pure functions
        - Implement `getEndGameThreshold(playerCount)` returning 40/35/30 for 2/3/4 players
        - Implement `calculateRunningTotals(rounds)` summing each player's scores across rounds
        - Implement `checkGameOver(runningTotals, playerCount)` comparing totals against threshold
        - Implement `determineWinner(runningTotals, lastRoundPlayerIndex?)` finding highest total with tie-break support
        - Implement `createRound(scores, roundEndType, roundNumber)` with validation (reject negative scores)
        - Implement helper `areAllNamesValid(names: string[]): boolean` for start-button logic
        - Implement `buildScoreboardRows(session: GameSession): ScoreboardRow[]` for deriving scoreboard data
        - Implement `getHighlightedPlayerIndex(runningTotals: number[]): number` returning index of highest total
        - _Requirements: 4.2, 4.4, 4.5, 5.1, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

    - [x] 3.2 Write unit tests for game logic (`__tests__/gameLogic.test.ts`)
        - Test `getEndGameThreshold` returns correct values for 2, 3, 4 players and throws for invalid counts
        - Test `createRound` rejects negative scores
        - Test `determineWinner` with clear winner, tied players, and tie-breaker resolution
        - Test `checkGameOver` at boundary values (exactly at threshold, one below)
        - Test `areAllNamesValid` with empty strings, whitespace-only, and valid names
        - Test `buildScoreboardRows` produces correct per-round scores and totals
        - Test `getHighlightedPlayerIndex` returns correct index
        - _Requirements: 4.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 3.4, 3.5_

    - [x] 3.3 Write property test: Seating order matches list order
        - **Property 1: Seating order matches list order**
        - For any list of 2-4 player names, assigned `seatIndex` equals input list index
        - **Validates: Requirements 3.3**

    - [x] 3.4 Write property test: Start button enabled iff all names non-empty
        - **Property 2: Start button enabled iff all names non-empty**
        - For any set of 2-4 player name inputs, `areAllNamesValid` returns true iff every name is non-empty and non-whitespace
        - **Validates: Requirements 3.4, 3.5**

    - [x] 3.5 Write property test: Game session initial state
        - **Property 3: Game session created with correct initial state**
        - For any valid 2-4 player names, new session has correct players, zero rounds, null winner, zero totals
        - **Validates: Requirements 3.6, 8.3**

    - [x] 3.6 Write property test: Score validation rejects negatives
        - **Property 4: Score validation rejects negative values**
        - For any negative integer, `createRound` rejects; for any non-negative integer, it accepts
        - **Validates: Requirements 4.2**

    - [x] 3.7 Write property test: Round submission updates session
        - **Property 5: Submitting a round updates session correctly**
        - For any session and valid round, round count increases by one, running totals equal sum of all round scores
        - **Validates: Requirements 4.4, 4.5**

    - [x] 3.8 Write property test: Running total is sum of round scores
        - **Property 6: Running total is sum of round scores**
        - For any sequence of rounds, each player's running total equals sum of their scores
        - **Validates: Requirements 4.5, 5.1**

    - [x] 3.9 Write property test: Scoreboard data completeness
        - **Property 7: Scoreboard data completeness**
        - For any session, derived scoreboard contains every player, every round score, round end types, and correct totals
        - **Validates: Requirements 5.1, 5.3**

    - [x] 3.10 Write property test: Rounds chronologically ordered
        - **Property 8: Rounds are chronologically ordered**
        - For any session, rounds are ordered by ascending round number, consecutive from 1
        - **Validates: Requirements 5.2**

    - [x] 3.11 Write property test: Highlighted player has highest total
        - **Property 9: Highest-total player is highlighted**
        - For any session with at least one round, highlighted player has the highest running total
        - **Validates: Requirements 5.4**

    - [x] 3.12 Write property test: Game over when threshold reached
        - **Property 11: Game over when threshold reached**
        - For any session where a player's total >= threshold, `checkGameOver` returns true; below threshold returns false
        - **Validates: Requirements 6.1**

    - [x] 3.13 Write property test: Winner has highest running total
        - **Property 12: Winner has highest running total**
        - For any game-over state with unique highest total, winner is that player
        - **Validates: Requirements 6.5**

    - [x] 3.14 Write property test: Tie-breaker resolves to last-round player
        - **Property 13: Tie-breaker resolves to last-round player**
        - For any game-over state with tied highest totals, providing a last-round player among tied players declares that player winner
        - **Validates: Requirements 6.6**

- [x]   4. Checkpoint - Core logic verified
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   5. Implement serialization and persistence utilities
    - [x] 5.1 Create `src/persistence.ts` with serialization functions
        - Implement `serializeGameSession(session: GameSession): string`
        - Implement `deserializeGameSession(json: string): GameSession` with error handling for corrupted data
        - _Requirements: 9.1, 9.2_

    - [x] 5.2 Write property test: Serialization round trip
        - **Property 15: Game session serialization round trip**
        - For any valid `GameSession`, serialize then deserialize produces equivalent session
        - **Validates: Requirements 9.1, 9.2**

    - [x] 5.3 Write unit tests for persistence edge cases (`__tests__/persistence.test.ts`)
        - Test corrupted JSON input returns null or throws gracefully
        - Test round-trip with empty rounds, mermaid win state, tie-breaker state
        - _Requirements: 9.1, 9.2_

- [ ]   6. Implement Zustand game store with persistence
    - [x] 6.1 Create `src/store/gameStore.ts` implementing `GameStore` interface
        - Implement `createGame` action: creates `GameSession` from `PlayerInput[]`, clears previous data
        - Implement `submitRound` action: validates scores, creates round, updates session, checks game-over, returns `RoundResult`
        - Implement `declareMermaidWin` action: sets winner, marks `mermaidWin: true`, does not add a round
        - Implement `resolveTie` action: validates player is among tied, sets winner with `isTieBreaker: true`
        - Implement `newGame` action: clears session and persisted data
        - Configure Zustand `persist` middleware with AsyncStorage
        - _Requirements: 3.6, 4.4, 4.5, 6.1, 6.5, 6.6, 7.2, 7.3, 8.3, 9.1, 9.3_

    - [x] 6.2 Write unit tests for game store (`__tests__/gameStore.test.ts`)
        - Test `createGame` produces correct initial state
        - Test `submitRound` updates rounds and running totals
        - Test `submitRound` triggers game-over when threshold reached
        - Test `declareMermaidWin` sets winner without adding round
        - Test `resolveTie` resolves tied game
        - Test `newGame` clears all state
        - _Requirements: 3.6, 4.4, 4.5, 6.1, 7.2, 7.3, 8.3_

    - [x] 6.3 Write property test: Mermaid win ends game without adding round
        - **Property 14: Mermaid win ends game without adding a round**
        - For any session and player index, declaring mermaid win sets winner, marks mermaid, does not increase round count
        - **Validates: Requirements 7.2, 7.3**

    - [x] 6.4 Write property test: New game clears persisted data
        - **Property 16: New game clears persisted data**
        - For any previously persisted session, calling `newGame` results in storage no longer containing old session
        - **Validates: Requirements 8.3, 9.3**

- [x]   7. Checkpoint - State management verified
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   8. Implement PlayerSetupScreen
    - [x] 8.1 Create `app/index.tsx` (PlayerSetupScreen) as the default route
        - Render player count selector (2, 3, 4) with toggle buttons
        - Render dynamic name input fields based on selected count
        - Disable start game button when any name is empty or whitespace-only
        - Enable start game button when all names are valid
        - On start game tap: call `createGame` from store and navigate to Scoreboard
        - Ensure responsive layout for phone, tablet, and desktop
        - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]   9. Implement ScoreboardScreen
    - [x] 9.1 Create `app/scoreboard.tsx` (ScoreboardScreen)
        - Display each player's name, per-round scores, and running total in a table/grid layout
        - Display rounds in chronological order with round-end type labels
        - Highlight the player with the highest running total
        - Provide "Add Round" button navigating to ScoreEntryScreen (hidden when game is over)
        - Provide "New Game" button navigating to PlayerSetupScreen
        - If game is over, show banner or redirect to GameOverScreen
        - _Requirements: 2.1, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2_

- [ ]   10. Implement ScoreEntryScreen
    - [x] 10.1 Create `app/score-entry.tsx` (ScoreEntryScreen)
        - Display numeric input field for each player
        - Validate scores are non-negative integers
        - Provide round-end type selector (STOP, LAST_CHANCE, EMPTY_DECK)
        - Provide "Mermaid Win" option to declare instant win for a specific player
        - On submit: call `submitRound` from store; navigate to Scoreboard if game continues, GameOver if game ends
        - On mermaid win: call `declareMermaidWin` from store; navigate to GameOver
        - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.1, 7.2, 7.3_

- [ ]   11. Implement GameOverScreen
    - [x] 11.1 Create `app/game-over.tsx` (GameOverScreen)
        - Display winner name and final scores
        - If game ended via mermaid win, display mermaid win message
        - If tie-breaker needed (winner is null, game is over), prompt user to select last-round player among tied players
        - On tie-breaker selection: call `resolveTie` from store
        - Provide "New Game" button: call `newGame` from store and navigate to PlayerSetupScreen
        - _Requirements: 6.5, 6.6, 7.2, 8.1, 8.2, 8.3_

- [ ]   12. Implement saved game restoration on app launch
    - [x] 12.1 Add launch logic in app root layout (`app/_layout.tsx`)
        - On app mount, check if Zustand persisted state contains a saved `GameSession`
        - If saved game exists, navigate to ScoreboardScreen
        - If no saved game, stay on PlayerSetupScreen (default route)
        - Handle corrupted persisted data gracefully (discard and start fresh)
        - _Requirements: 2.3, 9.1, 9.2_

- [x]   13. Checkpoint - All screens and navigation wired
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   14. Responsive layout and polish
    - [x] 14.1 Ensure responsive layout across platforms
        - Test and adjust layouts for phone, tablet, and desktop breakpoints
        - Ensure all screens adapt to different screen sizes
        - Verify navigation works correctly on web (URL-based) and native (stack-based)
        - _Requirements: 1.1, 1.2, 1.3, 2.2_

- [x]   15. Final checkpoint - Full integration verified
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All game logic is in pure functions (`gameLogic.ts`) for easy testing before wiring to UI

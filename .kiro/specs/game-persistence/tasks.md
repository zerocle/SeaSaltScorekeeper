# Implementation Plan: Game Persistence

## Overview

Extend the existing Zustand store and persistence layer to support game history. Add `GameRecord` type, `gameHistory` array to the store, automatic archival on game completion/abandonment, serialization helpers, and two new screens (history list + read-only detail). Implementation proceeds bottom-up: types → persistence → store → screens → navigation wiring.

## Tasks

- [x]   1. Add GameRecord type and persistence helpers
    - [x] 1.1 Add `GameStatus` and `GameRecord` types to `src/types.ts`
        - Add `GameStatus = "completed" | "abandoned"` type alias
        - Add `GameRecord` interface with `id`, `session`, `status`, `createdAt`, `completedAt` fields
        - _Requirements: 1.2, 2.2_

    - [x] 1.2 Add `serializeGameHistory` and `deserializeGameHistory` to `src/persistence.ts`
        - `serializeGameHistory(history: GameRecord[]): string` — JSON.stringify wrapper
        - `deserializeGameHistory(json: string): GameRecord[]` — returns `[]` on failure, logs `console.warn`
        - Handle empty string, corrupted JSON, and non-array inputs gracefully
        - _Requirements: 8.1, 8.2, 8.3, 8.4_

    - [x]\* 1.3 Write property test for serialization round-trip
        - **Property 8: Game history serialization round-trip**
        - Generate random `GameRecord[]` arrays, serialize then deserialize, assert deep equality
        - **Validates: Requirements 8.1, 8.2, 8.3**

    - [x]\* 1.4 Write unit tests for deserialization edge cases
        - Test corrupted JSON returns `[]` and logs warning
        - Test empty string returns `[]`
        - Test non-array JSON returns `[]`
        - _Requirements: 8.4_

- [x]   2. Extend Zustand store with game history
    - [x] 2.1 Add `gameHistory`, `archiveGame`, `deleteGameRecord`, and `clearHistory` to `src/store/gameStore.ts`
        - Add `gameHistory: GameRecord[]` to store state, defaulting to `[]`
        - Implement `archiveGame(status: GameStatus)`: guard if no `gameSession`, create `GameRecord` with unique id (`Date.now()-<random>`), snapshot session, append to `gameHistory`
        - Implement `deleteGameRecord(id: string)`: filter out record by id
        - Implement `clearHistory()`: set `gameHistory` to `[]`
        - All mutations persist automatically via existing `persist` middleware
        - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 6.2, 7.2_

    - [x] 2.2 Modify `newGame()` to archive abandoned games before clearing
        - Before setting `gameSession: null`, check if an active game exists with at least one round and no winner
        - If so, call `archiveGame("abandoned")`
        - _Requirements: 2.1, 2.2_

    - [x] 2.3 Modify `submitRound`, `declareMermaidWin`, and `resolveTie` to archive completed games
        - After setting a winner in each action, call `archiveGame("completed")`
        - _Requirements: 1.1, 1.2, 1.3_

    - [x]\* 2.4 Write property test for archive appending
        - **Property 1: Archiving a game appends a correctly-statused record**
        - Generate random `GameSession` with 1–5 rounds, random status, verify history grows by 1 and status matches
        - **Validates: Requirements 1.1, 2.1**

    - [x]\* 2.5 Write property test for GameRecord structural invariants
        - **Property 2: GameRecord structural invariants**
        - Generate random `GameRecord` via archival, verify non-empty id, valid ISO timestamps, abandoned records have `winner: null`
        - **Validates: Requirements 1.2, 2.2**

    - [x]\* 2.6 Write property test for delete removes exactly one record
        - **Property 6: Deleting a record removes exactly that record**
        - Generate random history of 1–10 records, pick random id, delete, verify length decreases by 1 and id is gone
        - **Validates: Requirements 6.2**

    - [x]\* 2.7 Write property test for clear produces empty array
        - **Property 7: Clearing history produces an empty array**
        - Generate random non-empty history, clear, verify empty
        - **Validates: Requirements 7.2**

- [x]   3. Checkpoint
    - Ensure all tests pass, ask the user if questions arise.
- [x]   4. Create History screen
    - [x] 4.1 Create `app/history.tsx` — HistoryScreen
        - Read `gameHistory` from the store, sort by `completedAt` descending
        - Render a `FlatList` of `GameHistoryItem` components
        - Show empty state message when history is empty
        - Add "Clear History" button that shows `ConfirmClearHistoryDialog`
        - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3_

    - [x] 4.2 Create `src/components/GameHistoryItem.tsx`
        - Display player names, winner name (or "Abandoned" badge), final scores, and game date
        - Make the row tappable, navigating to `/history-detail?id=<id>`
        - Add swipe-to-delete or delete button that shows `ConfirmDeleteGameDialog`
        - _Requirements: 4.2, 6.1_

    - [x] 4.3 Create `src/components/ConfirmClearHistoryDialog.tsx`
        - Reuse the modal pattern from `ConfirmNewGameDialog`
        - Props: `visible`, `onCancel`, `onConfirm`
        - _Requirements: 7.1, 7.3_

    - [x] 4.4 Create `src/components/ConfirmDeleteGameDialog.tsx`
        - Reuse the modal pattern from `ConfirmNewGameDialog`
        - Props: `visible`, `onCancel`, `onConfirm`
        - _Requirements: 6.1, 6.3_

    - [x]\* 4.5 Write property test for history ordering
        - **Property 3: History is ordered by completion timestamp descending**
        - Generate random array of `GameRecord` with varying timestamps, verify sort order on screen
        - **Validates: Requirements 4.1**

    - [x]\* 4.6 Write property test for history item display
        - **Property 4: History item display contains required information**
        - Generate random `GameRecord`, render `GameHistoryItem`, assert all player names, winner/abandoned, scores, and date are present
        - **Validates: Requirements 4.2**

    - [x]\* 4.7 Write unit tests for HistoryScreen
        - Test empty state message renders when history is empty
        - Test cancel on clear dialog leaves history unchanged
        - Test cancel on delete dialog leaves history unchanged
        - _Requirements: 4.3, 6.3, 7.3_

- [x]   5. Create History Detail screen (read-only scoreboard)
    - [x] 5.1 Create `app/history-detail.tsx` — HistoryDetailScreen
        - Read `id` from query params, find matching `GameRecord` in `gameHistory`
        - Reuse `buildScoreboardRows` and the scoreboard column/row rendering logic from `scoreboard.tsx`
        - Display round-end-type icons per round, player names, per-round scores, and totals
        - Do NOT render "Add Round" or "New Game" buttons
        - Show a back button to return to history list
        - _Requirements: 5.1, 5.2, 5.3_

    - [x]\* 5.2 Write property test for read-only scoreboard data equivalence
        - **Property 5: Read-only scoreboard data equivalence**
        - Generate random `GameSession`, wrap in `GameRecord`, compare `buildScoreboardRows` output with active session
        - **Validates: Requirements 5.2**

    - [x]\* 5.3 Write unit tests for HistoryDetailScreen
        - Test that "Add Round" and "New Game" buttons are not rendered
        - Test that round-by-round scores match the stored session
        - _Requirements: 5.3_

- [x]   6. Wire navigation and register new routes
    - [x] 6.1 Add "Game History" button to `app/index.tsx` (PlayerSetupScreen)
        - Add a button below the "Start Game" button that navigates to `/history`
        - _Requirements: 4.4_

    - [x] 6.2 Add "History" button to `app/scoreboard.tsx` (ScoreboardScreen)
        - Add a button in the button container that navigates to `/history`
        - _Requirements: 4.4_

    - [x] 6.3 Register `history` and `history-detail` routes in `app/_layout.tsx`
        - Add `<Stack.Screen name="history" />` and `<Stack.Screen name="history-detail" />` to the Stack
        - _Requirements: 4.4_

- [x]   7. Checkpoint
    - Ensure all tests pass, ask the user if questions arise.

- [x]   8. Handle app resume with persisted active game
    - [x] 8.1 Verify existing hydration logic in `app/_layout.tsx` handles resume correctly
        - The existing `_layout.tsx` already checks for a persisted `gameSession` on hydration and navigates to `/scoreboard` if found
        - Verify that corrupted data triggers `newGame()` and shows setup screen (existing catch block)
        - No code changes expected — this is a verification task confirming Requirement 3 is already satisfied by the existing architecture plus the new `gameHistory` default
        - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x]   9. Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (already in devDependencies)
- Component tests use `@testing-library/react-native` (already in devDependencies)
- The existing `persist` middleware and `StateStorage` adapters are reused — no new storage layer needed
- `gameHistory` defaults to `[]`, so existing users with no history gracefully migrate without a version bump

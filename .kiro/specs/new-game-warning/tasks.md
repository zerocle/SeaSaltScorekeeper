# Implementation Plan: New Game Warning

## Overview

Add a confirmation dialog when tapping "New Game" on the Scoreboard while a game is in progress. Implementation proceeds bottom-up: ConfirmNewGameDialog component → scoreboard.tsx integration → tests.

## Tasks

- [x]   1. Create ConfirmNewGameDialog component
    - [x] 1.1 Create `src/components/ConfirmNewGameDialog.tsx`
        - Implement `ConfirmNewGameDialogProps` interface (`visible`, `onCancel`, `onConfirm`)
        - Render a React Native `Modal` with `transparent` and `animationType="fade"`
        - Render a semi-transparent overlay `TouchableOpacity` that calls `onCancel` on press
        - Render a themed card with a title indicating the game is not finished
        - Render a message body informing the player that progress will be discarded
        - Render a "Cancel" button (outline variant) calling `onCancel` with `accessibilityLabel="Cancel"`
        - Render a "Start New Game" button (primary/destructive variant) calling `onConfirm` with `accessibilityLabel="Start New Game"`
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3_

    - [ ]\* 1.2 Write property test: Dialog visibility matches game-in-progress state
        - **Property 1: Dialog visibility matches game-in-progress state**
        - Generate random game sessions (with and without winners), apply the `isGameOver` decision logic, assert dialog should show iff `winner === null && players.length > 0`
        - **Validates: Requirements 1.1, 1.2**

    - [ ]\* 1.3 Write unit tests for ConfirmNewGameDialog
        - Verify dialog renders title and message when `visible={true}`
        - Verify dialog renders nothing meaningful when `visible={false}`
        - Verify pressing overlay backdrop calls `onCancel`
        - Verify pressing "Cancel" button calls `onCancel`
        - Verify pressing "Start New Game" button calls `onConfirm`
        - Verify both buttons have correct `accessibilityLabel` props
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.3_

- [x]   2. Integrate dialog into Scoreboard
    - [x] 2.1 Modify `handleNewGame` in `app/scoreboard.tsx`
        - Add `const [showNewGameWarning, setShowNewGameWarning] = useState(false)` state
        - Change `handleNewGame` to check `isGameOver`: if `true`, call `newGame()` + `router.replace("/")` directly; if `false`, call `setShowNewGameWarning(true)`
        - Add `handleConfirmNewGame` callback that calls `newGame()`, `router.replace("/")`, and `setShowNewGameWarning(false)`
        - Render `<ConfirmNewGameDialog visible={showNewGameWarning} onCancel={() => setShowNewGameWarning(false)} onConfirm={handleConfirmNewGame} />`
        - _Requirements: 1.1, 1.2, 3.1, 3.2_

    - [ ]\* 2.2 Write property test: Cancel preserves game state
        - **Property 2: Cancel preserves game state**
        - Generate random in-progress game sessions, simulate showing dialog and pressing Cancel, assert game session is unchanged
        - **Validates: Requirements 2.3, 3.1**

    - [ ]\* 2.3 Write property test: Confirm triggers game reset
        - **Property 3: Confirm triggers game reset**
        - Generate random in-progress game sessions, simulate pressing "Start New Game", assert `onConfirm` was called exactly once
        - **Validates: Requirements 2.4, 3.2**

- [x]   3. Checkpoint
    - Ensure all tests pass, ask the user if questions arise.

- [x]   4. Verify Game Over screen is unchanged
    - [x] 4.1 Confirm `app/game-over.tsx` does not import or render `ConfirmNewGameDialog`
        - No code changes needed — this is a verification that the Game Over screen still calls `newGame()` directly
        - _Requirements: 4.1_

- [x]   5. Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (already in devDependencies)
- Component tests use `@testing-library/react-native` (already in devDependencies)
- No changes to `src/store/gameStore.ts`, game logic, or `app/game-over.tsx`

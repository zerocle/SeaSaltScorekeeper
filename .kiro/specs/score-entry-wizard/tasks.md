# Implementation Plan: Score Entry Wizard

## Overview

Refactor `app/score-entry.tsx` from a monolithic conditional-rendering screen into a multi-step wizard using a discriminated union state machine. All changes stay within the single screen file, reusing existing components (`ScoreTable`, `NumericCell`, `PaperButton`, `FoldedCard`). The wizard starts with round end type selection (Step 1), then branches into Stop, Last Chance, or Empty Deck sub-flows (Step 2).

## Tasks

- [x]   1. Define WizardStep type and transition functions
    - [x] 1.1 Define the `WizardStep` discriminated union type at the top of `app/score-entry.tsx`
        - Type with 7 variants: `selectRoundEndType`, `stopFlow`, `lastChance_selectCaller`, `lastChance_enterBreakdowns`, `lastChance_showOutcome`, `lastChance_enterBonuses`, `emptyDeckFlow`
        - Each Last Chance variant carries the appropriate payload (`callerIndex`, `outcome`)
        - _Requirements: 1.2, 5.1_

    - [x] 1.2 Implement wizard transition functions inside the screen component
        - `goToStep1()`: resets wizard state to `{ step: 'selectRoundEndType' }` without clearing breakdowns or colorBonuses
        - `selectRoundEndType(type)`: transitions to the correct sub-flow initial step
        - `selectCaller(playerIndex)`: transitions to `lastChance_enterBreakdowns`
        - `determineOutcome()`: validates, calculates outcome, transitions to `lastChance_showOutcome`
        - `proceedToBonuses()`: transitions to `lastChance_enterBonuses`
        - _Requirements: 1.2, 3.3, 3.4, 5.2, 5.3_

    - [ ]\* 1.3 Write property test: round end type selection produces correct wizard state (Property 1)
        - **Property 1: Round end type selection produces correct wizard state**
        - **Validates: Requirements 1.2**

    - [ ]\* 1.4 Write property test: back navigation resets wizard state but preserves breakdowns (Property 8)
        - **Property 8: Back navigation resets wizard state but preserves breakdowns**
        - **Validates: Requirements 2.6, 3.9, 4.4, 5.1, 5.2, 5.3**

- [x]   2. Refactor screen to use wizard state machine rendering
    - [x] 2.1 Replace existing conditional rendering with a `switch` on `wizardState.step`
        - Replace `roundEndType` useState + `isLastChance` conditional with `wizardState` useState initialized to `{ step: 'selectRoundEndType' }`
        - Remove old `lastChanceStep` state, `callerIndex` state, and `lastChanceOutcome` state (these now live inside `WizardStep` variants)
        - Keep `breakdowns`, `colorBonuses`, `validationErrors`, `crossPlayerErrors`, `submitAttempted` as separate useState hooks (persisted across wizard steps)
        - Render different JSX based on `wizardState.step`
        - _Requirements: 1.1, 1.2, 5.3, 5.4_

- [x]   3. Implement Step 1: Round End Type Selector
    - [x] 3.1 Render the `selectRoundEndType` step
        - Display round number title ("Round N")
        - Render three `PaperButton`s for "Stop", "Last Chance", "Empty Deck"
        - Each button calls `selectRoundEndType(type)` to advance the wizard
        - _Requirements: 1.1, 1.3, 1.4_

- [ ]   4. Implement Stop Flow
    - [x] 4.1 Render the `stopFlow` step
        - Display `ScoreTable` with all existing props (breakdowns, cardScores, validationErrors, crossPlayerErrors, onBreakdownChange, onMermaidInstantWin, submitAttempted)
        - Display a back button that calls `goToStep1()`
        - Display a "Submit Round" button that validates and submits via `handleSubmit()`
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

    - [ ]\* 4.2 Write property test: invalid breakdowns block submission (Property 2)
        - **Property 2: Invalid breakdowns block submission and preserve wizard step**
        - **Validates: Requirements 2.3, 2.4**

    - [ ]\* 4.3 Write property test: valid breakdowns produce correct round scores (Property 3)
        - **Property 3: Valid breakdowns in Stop Flow produce correct round scores**
        - **Validates: Requirements 2.5**

- [x]   5. Checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ]   6. Implement Last Chance Flow
    - [x] 6.1 Render the `lastChance_selectCaller` step
        - Display a `FoldedCard` with "Select Caller" title and description
        - Render a `PaperButton` for each player to select them as caller
        - Display a back button that calls `goToStep1()`
        - _Requirements: 3.1, 3.2, 3.9_

    - [x] 6.2 Render the `lastChance_enterBreakdowns` step
        - Display caller badge showing selected caller name (from `wizardState.callerIndex`)
        - Display `ScoreTable` for card breakdown entry
        - Display "Determine Outcome" button that calls `determineOutcome()`
        - Display a back button that calls `goToStep1()`
        - _Requirements: 3.3, 3.8, 3.9_

    - [x] 6.3 Render the `lastChance_showOutcome` step
        - Display outcome (won/lost) with styled title and explanation text
        - Display "Enter Color Bonuses" button that calls `proceedToBonuses()`
        - Display caller badge
        - _Requirements: 3.5, 3.8_

    - [x] 6.4 Render the `lastChance_enterBonuses` step
        - Display caller badge with outcome status
        - Display color bonus `NumericCell` inputs for appropriate players (all if won, only caller if lost)
        - Display "Submit Round" button that calls `handleLastChanceSubmit()`
        - _Requirements: 3.6, 3.7, 3.8_

    - [ ]\* 6.5 Write property test: caller selection transitions correctly (Property 4)
        - **Property 4: Caller selection transitions to enter-breakdowns with correct caller index**
        - **Validates: Requirements 3.3**

    - [ ]\* 6.6 Write property test: Last Chance outcome determination (Property 5)
        - **Property 5: Last Chance outcome is correctly determined from card scores**
        - **Validates: Requirements 3.4**

    - [ ]\* 6.7 Write property test: color bonus fields match outcome rules (Property 6)
        - **Property 6: Color bonus fields match outcome rules**
        - **Validates: Requirements 3.6**

    - [ ]\* 6.8 Write property test: Last Chance submission produces correct scores (Property 7)
        - **Property 7: Last Chance submission produces correct round scores**
        - **Validates: Requirements 3.7**

- [x]   7. Implement Empty Deck Flow
    - [x] 7.1 Render the `emptyDeckFlow` step
        - Display informational message that no scores are counted
        - Display a back button that calls `goToStep1()`
        - Display a confirm button that calls `submitEmptyDeck()` (submits zero scores for all players with round end type "EMPTY_DECK")
        - _Requirements: 4.1, 4.2, 4.3, 4.4_

    - [ ]\* 7.2 Write property test: Empty Deck produces zero scores (Property 9)
        - **Property 9: Empty Deck submission produces zero scores for all players**
        - **Validates: Requirements 4.3**

- [x]   8. Checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x]   9. Mermaid instant win and test updates
    - [x] 9.1 Verify mermaid instant win detection works in both Stop and Last Chance flows
        - Ensure `onMermaidInstantWin` callback is passed to `ScoreTable` in both `stopFlow` and `lastChance_enterBreakdowns` steps
        - Existing `handleMermaidInstantWin` logic (Alert/confirm → `declareMermaidWin` → navigate to game-over) remains unchanged
        - _Requirements: 6.1, 6.2_

    - [ ]\* 9.2 Write property test: mermaid instant win triggers at count 4 (Property 10)
        - **Property 10: Mermaid instant win triggers at count 4**
        - **Validates: Requirements 6.1**

    - [ ]\* 9.3 Update existing screen tests for the refactored wizard flow
        - Update or add tests in `app/__tests__/` to verify wizard step rendering (type selector on open, sub-flow transitions)
        - Verify no-session redirect still works
        - _Requirements: 1.1, 5.4_

- [x]   10. Final checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests go in `src/components/__tests__/ScoreEntryWizard.property.test.tsx`
- Unit tests go in `src/components/__tests__/ScoreEntryWizard.test.tsx` or update `app/__tests__/screens.component.test.tsx`
- All changes are scoped to `app/score-entry.tsx` — no new routes or shared components needed
- Existing components (`ScoreTable`, `NumericCell`, `PaperButton`, `FoldedCard`) are reused as-is

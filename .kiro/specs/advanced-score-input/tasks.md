# Implementation Plan: Advanced Score Input

## Overview

Replace the single-number score entry with category-based card breakdown input. Implementation proceeds from data models → pure scoring engine → store integration → UI refactor, with property-based tests validating each scoring rule. TypeScript throughout, using fast-check for property tests.

## Tasks

- [x]   1. Define new data model types
    - [x] 1.1 Add card breakdown and Last Chance types to `src/types.ts`
        - Add `DuoCards`, `CollectorCards`, `MultiplierCards`, `MermaidEntry`, `CardBreakdown`, `PlayerCardBreakdown` interfaces
        - Add `LastChanceOutcome`, `LastChanceRoundData` types
        - Add `ValidationResult` type for breakdown validation
        - Extend `Round` interface with optional `breakdowns?: PlayerCardBreakdown[]` and `lastChanceData?: LastChanceRoundData` fields
        - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x]   2. Implement scoring engine with pure functions
    - [x] 2.1 Create `src/scoringEngine.ts` with collector scoring table lookups
        - Define `SHELL_POINTS`, `OCTOPUS_POINTS`, `PENGUIN_POINTS`, `SAILOR_POINTS` constant arrays
        - Implement `getShellPoints(count)`, `getOctopusPoints(count)`, `getPenguinPoints(count)`, `getSailorPoints(count)`
        - Implement `calculateCollectorPoints(collectorCards)` summing all collector lookups
        - _Requirements: 2.5, 2.6, 2.7, 2.8_

    - [x] 2.2 Implement duo, multiplier, and mermaid scoring functions
        - Implement `calculateDuoPoints(duoCards)` — sum of all pair/combo counts
        - Implement `calculateMultiplierPoints(multiplierCards, duoCards, collectorCards)` — lighthouse×boats×2 + shoal×fish×2 + colony×penguins×2 + captain×sailors×3
        - Implement `calculateMermaidPoints(mermaids)` — sum of all color counts
        - Implement `calculateCardScore(breakdown)` — sum of all four category scores
        - _Requirements: 1.6, 3.5, 3.6, 3.7, 3.8, 4.3, 4.4, 5.1_

    - [x] 2.3 Implement Last Chance resolution functions
        - Implement `determineLastChanceOutcome(callerCardScore, opponentCardScores)` — won iff caller >= all opponents
        - Implement `calculateLastChanceRoundScores(playerBreakdowns, callerIndex, colorBonuses)` — applies won/lost scoring rules
        - _Requirements: 6.3, 6.4, 6.7, 6.8, 6.10, 6.11_

    - [x] 2.4 Implement card breakdown validation
        - Implement `validateCardBreakdown(breakdown)` — checks all constraints (duo >= 0, collectors within max, mermaids 0-4, color counts >= 0)
        - _Requirements: 9.1, 9.2, 9.3_

    - [ ]\* 2.5 Write unit tests for scoring table lookups (`__tests__/scoringEngine.test.ts`)
        - Test all entries in Shell, Octopus, Penguin, Sailor scoring tables
        - Test specific Last Chance scenarios (caller wins, caller loses with known values)
        - Test edge cases: all-zero breakdown, mermaid count of 4
        - _Requirements: 2.5, 2.6, 2.7, 2.8, 6.3, 6.4_

    - [ ]\* 2.6 Write property test: Duo points equal sum of pair/combo counts
        - **Property 1: Duo points equal sum of pair/combo counts**
        - **Validates: Requirements 1.6**

    - [ ]\* 2.7 Write property test: Multiplier points follow multiplication rules
        - **Property 2: Multiplier points follow multiplication rules**
        - **Validates: Requirements 3.5, 3.6, 3.7, 3.8**

    - [ ]\* 2.8 Write property test: Mermaid points equal sum of color counts
        - **Property 3: Mermaid points equal sum of color counts**
        - **Validates: Requirements 4.3, 4.4**

    - [ ]\* 2.9 Write property test: Card score is sum of all category scores
        - **Property 4: Card score is sum of all category scores**
        - **Validates: Requirements 5.1**

    - [ ]\* 2.10 Write property test: Non-Last-Chance round score equals card score
        - **Property 5: Non-Last-Chance round score equals card score**
        - **Validates: Requirements 5.3**

    - [ ]\* 2.11 Write property test: Last Chance outcome determination
        - **Property 6: Last Chance outcome is won iff caller score >= all opponents**
        - **Validates: Requirements 6.3, 6.4**

    - [ ]\* 2.12 Write property test: Last Chance round scoring follows outcome rules
        - **Property 7: Last Chance round scoring follows outcome rules**
        - **Validates: Requirements 6.7, 6.8, 6.10, 6.11**

    - [ ]\* 2.13 Write property test: Card breakdown validation
        - **Property 8: Card breakdown validation accepts valid inputs and rejects invalid ones**
        - **Validates: Requirements 1.5, 9.1, 9.2, 9.3**

- [x]   3. Checkpoint - Scoring engine verified
    - Ensure all tests pass, ask the user if questions arise.

- [x]   4. Extend store to accept card breakdowns
    - [x] 4.1 Update `submitRound` in `src/store/gameStore.ts` to accept optional breakdowns and Last Chance data
        - Extend `submitRound` signature to accept optional `breakdowns?: PlayerCardBreakdown[]` and `lastChanceData?: LastChanceRoundData`
        - Store breakdowns and lastChanceData on the Round object
        - Update `GameStore` interface accordingly
        - _Requirements: 7.1, 7.2, 7.3_

    - [ ]\* 4.2 Write unit tests for extended submitRound (`__tests__/gameStore.test.ts`)
        - Test that submitting a round with breakdowns stores them on the round
        - Test that submitting a Last Chance round stores caller index, outcome, and color bonuses
        - Test backward compatibility: submitting without breakdowns still works
        - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x]   5. Extend serialization for card breakdowns
    - [x] 5.1 Update `src/persistence.ts` to handle rounds with card breakdown and Last Chance data
        - Ensure serialization/deserialization preserves `breakdowns` and `lastChanceData` fields on Round
        - Handle legacy rounds without these fields gracefully (treat as undefined)
        - _Requirements: 8.1, 8.2, 8.3, 7.4_

    - [ ]\* 5.2 Write property test: Round with card breakdown serialization round trip
        - **Property 9: Round with card breakdown serialization round trip**
        - **Validates: Requirements 8.1, 8.2, 8.3**

- [x]   6. Checkpoint - Data layer verified
    - Ensure all tests pass, ask the user if questions arise.

- [x]   7. Refactor Score Entry Screen with card breakdown UI
    - [x] 7.1 Refactor `app/score-entry.tsx` — round end type selection and player card breakdown form
        - Replace single numeric input per player with expandable card breakdown sections (Duo, Collector, Multiplier, Mermaid)
        - Default all card count inputs to 0
        - Display real-time calculated Card_Score per player as inputs change
        - Validate inputs per constraints (duo >= 0, collectors within max, mermaids 0-4, color counts >= 0)
        - Show validation errors and prevent submission on invalid input
        - Keep round end type selector (STOP, LAST_CHANCE, EMPTY_DECK)
        - For STOP/EMPTY_DECK: compute Round_Score = Card_Score, call `submitRound` with breakdowns, navigate accordingly
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.5, 5.1, 5.2, 5.3, 9.1, 9.2, 9.3, 9.4, 9.5_

    - [x] 7.2 Implement Last Chance multi-step flow in score entry
        - When LAST_CHANCE is selected, prompt user to select the Caller before card entry
        - After all breakdowns entered, call `determineLastChanceOutcome` and display the outcome
        - Prompt for each player's Color_Bonus input
        - Call `calculateLastChanceRoundScores` to compute final Round_Scores
        - Submit round with breakdowns and lastChanceData
        - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_

    - [x] 7.3 Implement mermaid count of 4 instant win prompt
        - When a player sets mermaid count to 4, display prompt asking whether to declare Mermaid instant win
        - If confirmed, call `declareMermaidWin` and navigate to game-over
        - _Requirements: 4.5_

- [x]   8. Update Scoreboard to display card breakdowns
    - [x] 8.1 Update `app/scoreboard.tsx` to show breakdown details for rounds that have them
        - For rounds with `breakdowns` field, allow expanding to see per-category scores
        - For legacy rounds without breakdowns, display stored total only
        - Display Last Chance metadata (caller, outcome) for Last Chance rounds
        - _Requirements: 7.4_

- [x]   9. Final checkpoint - Full integration verified
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The scoring engine is fully pure-functional and testable independently of UI/store
- Backward compatibility with legacy rounds (no breakdown data) is maintained throughout

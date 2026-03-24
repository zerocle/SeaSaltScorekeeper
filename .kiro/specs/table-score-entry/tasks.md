# Implementation Plan: Table Score Entry

## Overview

Replace the collapsible/expander-based score entry UI in `app/score-entry.tsx` with a table layout. All changes are confined to this single file. The table renders card type labels in a sticky left column and one column per player for numeric inputs and multiplier toggles. No changes to types, scoring engine, game store, or persistence.

## Tasks

- [x]   1. Create sub-components: NumericCell, MultiplierToggle, CategoryHeaderRow, ScoreFooterRow
    - [x] 1.1 Implement `NumericCell` component with `NumericCellProps` interface
        - Compact numeric `TextInput` with `keyboardType="numeric"` and `placeholder="0"`
        - Reuse existing `parseIntSafe` for input handling and blur normalization
        - _Requirements: 2.1, 2.2, 2.3, 2.4_
    - [x] 1.2 Implement `MultiplierToggle` component with `MultiplierToggleProps` interface
        - Inline boolean toggle with active/inactive visual states
        - `accessibilityRole="checkbox"` with `accessibilityState={{ checked }}`
        - _Requirements: 3.1, 3.4_
    - [x] 1.3 Implement `CategoryHeaderRow` component with `CategoryHeaderRowProps` interface
        - Full-width row displaying a category name (e.g., "🦀 Duo Cards")
        - _Requirements: 1.4_
    - [x] 1.4 Implement `ScoreFooterRow` component with `ScoreFooterRowProps` interface
        - Displays computed card score per player at the bottom of the table
        - _Requirements: 5.1, 5.2_

- [x]   2. Create CardRow component and ScoreTable shell
    - [x] 2.1 Implement `CardRow` component with `CardRowProps` interface
        - Renders label cell + one `NumericCell` per player
        - Optionally renders `MultiplierToggle` per player when `multiplier` prop is provided
        - _Requirements: 1.3, 2.3, 3.1_
    - [x] 2.2 Implement `ScoreTable` component with `ScoreTableProps` interface
        - Render `TableHeader` row with player names as column headers
        - Render all card type rows in order: Crabs, Boats, Fish, Swimmer+Shark, Shells, Octopus, Penguins, Sailors, Mermaid Count
        - Insert `CategoryHeaderRow` for "Duo Cards", "Collector Cards", "Mermaids" above their groups
        - Render `ScoreFooterRow` at the bottom
        - Wire `onBreakdownChange` callbacks to update the correct field in the correct player's `CardBreakdown`
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 3.2, 3.3, 5.1, 5.2_

- [x]   3. Implement mermaid dynamic rows and validation row
    - [x] 3.1 Implement dynamic `MermaidColorRows` within `ScoreTable`
        - Render one color-count row per mermaid per player, based on each player's individual mermaid count (0–4)
        - Clamp mermaid count to 0–4 in update handler
        - Trigger `onMermaidInstantWin` when a player's mermaid count reaches 4
        - _Requirements: 4.1, 4.2, 4.3, 4.4_
    - [x] 3.2 Implement `ValidationRow` within `ScoreTable`
        - Display per-player validation errors below the score footer when `submitAttempted` is true and errors exist
        - _Requirements: 6.1, 6.2_

- [x]   4. Implement horizontal scroll with sticky label column
    - [x] 4.1 Implement the sticky label column layout
        - Label column rendered outside the horizontal `ScrollView` with fixed width
        - Player columns rendered inside a horizontal `ScrollView`
        - Outer container uses `flexDirection: 'row'`
        - _Requirements: 7.1, 7.2_

- [x]   5. Checkpoint
    - Ensure the table renders correctly for 2, 3, and 4 players. Ensure all tests pass, ask the user if questions arise.

- [x]   6. Integrate ScoreTable into ScoreEntryScreen and remove old components
    - [x] 6.1 Replace `PlayerBreakdownForm` usage in `ScoreEntryScreen` with `ScoreTable`
        - Pass `breakdowns`, `cardScores`, `validationErrors`, `players`, `onBreakdownChange`, `onMermaidInstantWin`, and `submitAttempted` as props
        - Use `ScoreTable` in both the normal flow and the Last Chance "enter-breakdowns" step
        - _Requirements: 1.1, 8.1, 8.2, 8.3, 8.4_
    - [x] 6.2 Remove old components: `CollapsibleSection`, `NumericFieldWithMultiplier`, `PlayerBreakdownForm`
        - Keep a simplified `NumericField` for the Last Chance color bonus step
        - Remove associated styles that are no longer used
        - _Requirements: 1.1_

- [x]   7. Add styles for all new table components
    - Define `StyleSheet` entries for table container, label column, player columns, header row, card rows, numeric cells, multiplier toggles, category headers, score footer, and validation row
    - Remove unused styles from the old collapsible/expander components
    - _Requirements: 3.4, 7.1, 7.2_

- [x]   8. Checkpoint
    - Ensure the full score entry flow works end-to-end: normal submit, Last Chance flow, mermaid instant win. Ensure all tests pass, ask the user if questions arise.

- [ ]   9. Property-based tests for pure logic
    - [ ]\* 9.1 Write property test: parseIntSafe normalizes non-numeric input to zero
        - **Property 5: Non-numeric and empty input normalizes to zero**
        - Generate arbitrary strings (empty, whitespace, alpha, symbols, valid numbers); verify `parseIntSafe` returns 0 for non-numeric and the correct integer for valid numbers
        - **Validates: Requirements 2.4**
    - [ ]\* 9.2 Write property test: numeric input updates the correct breakdown field
        - **Property 4: Numeric input updates the correct breakdown field**
        - Generate random (playerIndex, fieldName, value) triples; apply change to breakdowns array; verify only the target field updated and all other players' breakdowns unchanged
        - **Validates: Requirements 2.3**
    - [ ]\* 9.3 Write property test: multiplier toggle round-trip
        - **Property 6: Multiplier toggle round-trip**
        - Generate random (playerIndex, multiplierType, boolean) triples; apply toggle; verify field matches and other fields unchanged
        - **Validates: Requirements 3.2, 3.3**
    - [ ]\* 9.4 Write property test: decreasing mermaid count truncates from the bottom
        - **Property 8: Decreasing mermaid count truncates from the bottom**
        - Generate random initial mermaid arrays (1–4 entries with random colorCounts), then a smaller target count; verify truncation preserves first N entries
        - **Validates: Requirements 4.4**
    - [ ]\* 9.5 Write property test: footer score equals calculateCardScore
        - **Property 9: Footer score equals calculateCardScore**
        - Generate random valid `CardBreakdown` values; verify computed score equals `calculateCardScore(breakdown)`
        - **Validates: Requirements 5.1, 5.2**
    - [ ]\* 9.6 Write property test: invalid breakdowns produce validation errors on submit
        - **Property 10: Invalid breakdowns produce validation errors on submit**
        - Generate random invalid `CardBreakdown` values (e.g., shells=7, negative counts); verify validation errors match `validateCardBreakdown` output
        - **Validates: Requirements 6.1**

- [ ]   10. Property-based tests for rendering logic
    - [ ]\* 10.1 Write property test: column count matches player count
        - **Property 1: Column count matches player count**
        - Generate random player counts (2–4); verify rendered column count = 1 label column + N player columns
        - **Validates: Requirements 1.1, 1.5**
    - [ ]\* 10.2 Write property test: player names appear in column headers
        - **Property 2: Player names appear in column headers**
        - Generate random player name arrays; verify all names appear in header row in order
        - **Validates: Requirements 1.2**
    - [ ]\* 10.3 Write property test: mermaid color rows match per-player mermaid count
        - **Property 7: Mermaid color rows match per-player mermaid count**
        - Generate random mermaid count arrays (one per player, each 0–4); verify rendered color row counts match per player
        - **Validates: Requirements 4.1, 4.2**
    - [ ]\* 10.4 Write property test: all numeric cells have numeric keyboard and "0" placeholder
        - **Property 3: All numeric cells have numeric keyboard and "0" placeholder**
        - Render table; query all numeric inputs; verify `keyboardType` and `placeholder` attributes
        - **Validates: Requirements 2.1, 2.2**

- [x]   11. Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All changes are confined to `app/score-entry.tsx` — no modifications to types, scoring engine, or game store
- Property tests use `fast-check` (already in devDependencies) with a minimum of 100 iterations per property
- Test file: `__tests__/scoreTable.property.test.ts` for pure logic properties, rendering properties may need React Native Testing Library
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation

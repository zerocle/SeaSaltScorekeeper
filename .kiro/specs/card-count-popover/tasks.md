# Implementation Plan: Card Count Popover

## Overview

Replace keyboard-based `NumericCell` inputs with a tap-to-select popover grid picker. Implementation proceeds bottom-up: constants → popover component → NumericCell refactor → ScoreTable wiring → tests.

## Tasks

- [x]   1. Create DECK_MAX constant map
    - [x] 1.1 Create `src/deckLimits.ts` exporting `DECK_MAX: Record<string, number>` with all card type maximums (crabs→9, boats→8, fish→7, swimmerSharkCombos→10, shells→6, octopus→5, penguins→3, sailors→2, mermaidCount→4, mermaidColorCount→9)
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

    - [ ]\* 1.2 Write unit tests for DECK_MAX values
        - Verify each card type key maps to the correct maximum value
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x]   2. Implement CardCountPopover component
    - [x] 2.1 Create `CardCountPopover` component in `app/score-entry.tsx`
        - Implement `CardCountPopoverProps` interface (`visible`, `currentValue`, `maxValue`, `onSelect`, `onClose`, `accessibilityLabel`)
        - Render a `Modal` with transparent backdrop `TouchableOpacity` that calls `onClose`
        - Render a centered white card containing number buttons 0 through `maxValue` in a `flexWrap` grid (5 columns)
        - Highlight the button matching `currentValue` with a distinct background color
        - Each button has `accessibilityRole="button"` and `accessibilityLabel={`Select ${n}`}`
        - Pressing a number button calls `onSelect(n)`
        - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.2, 6.1_

    - [ ]\* 2.2 Write property test: Popover renders exactly 0..maxValue buttons
        - **Property 1: Popover renders exactly 0..maxValue buttons**
        - **Validates: Requirements 1.2, 2.1–2.10**

    - [ ]\* 2.3 Write property test: Selecting a number calls onSelect with that number
        - **Property 2: Selecting a number calls onSelect with that number**
        - **Validates: Requirements 1.3, 5.3**

    - [ ]\* 2.4 Write property test: Exactly one button is highlighted matching currentValue
        - **Property 3: Exactly one button is highlighted matching currentValue**
        - **Validates: Requirements 3.1**

    - [ ]\* 2.5 Write property test: All popover buttons have correct accessibility attributes
        - **Property 5: All popover buttons have correct accessibility attributes**
        - **Validates: Requirements 6.1**

- [x]   3. Refactor NumericCell to use popover
    - [x] 3.1 Modify `NumericCell` in `app/score-entry.tsx`
        - Add `maxValue` prop to `NumericCellProps` interface
        - Replace `TextInput` with `TouchableOpacity` wrapping a read-only `Text` displaying the current value
        - Add internal `popoverVisible` boolean state
        - On press → set `popoverVisible = true`
        - Render `CardCountPopover` with `visible={popoverVisible}`, passing `value`, `maxValue`, `onChange`, and `accessibilityLabel`
        - On select → call `onChange(selectedValue)`, set `popoverVisible = false`
        - On close → set `popoverVisible = false`
        - Remove `parseIntSafe` usage and `TextInput`-related state (`text`, `handleChange`, `handleBlur`)
        - _Requirements: 1.1, 5.1, 5.2, 6.2_

    - [ ]\* 3.2 Write property test: Closed NumericCell displays value as read-only text
        - **Property 4: Closed NumericCell displays value as read-only text**
        - **Validates: Requirements 5.1, 5.2**

    - [ ]\* 3.3 Write unit test: NumericCell opens popover on press
        - Verify pressing the cell shows the popover modal
        - _Requirements: 1.1_

    - [ ]\* 3.4 Write unit test: Tap outside dismisses popover
        - Verify `onClose` is called when backdrop is pressed, value unchanged
        - _Requirements: 1.4_

- [x]   4. Checkpoint
    - Ensure all tests pass, ask the user if questions arise.

- [x]   5. Wire maxValue through ScoreTable
    - [x] 5.1 Update `renderCardRowPlayerCells` in `app/score-entry.tsx`
        - Add optional `maxValue` parameter to `renderCardRowPlayerCells`
        - Pass `maxValue` through to each `NumericCell` rendered in the row
        - _Requirements: 2.1–2.10_

    - [x] 5.2 Pass correct DECK_MAX values at each call site in `ScoreTable`
        - Import `DECK_MAX` from `src/deckLimits.ts`
        - Crabs row: `maxValue={DECK_MAX.crabs}` (9)
        - Boats row: `maxValue={DECK_MAX.boats}` (8)
        - Fish row: `maxValue={DECK_MAX.fish}` (7)
        - Swimmer+Shark row: `maxValue={DECK_MAX.swimmerSharkCombos}` (10)
        - Shells row: `maxValue={DECK_MAX.shells}` (6)
        - Octopus row: `maxValue={DECK_MAX.octopus}` (5)
        - Penguins row: `maxValue={DECK_MAX.penguins}` (3)
        - Sailors row: `maxValue={DECK_MAX.sailors}` (2)
        - Mermaid Count row: `maxValue={DECK_MAX.mermaidCount}` (4)
        - Mermaid Color Count rows: `maxValue={DECK_MAX.mermaidColorCount}` (9)
        - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 5.3_

    - [ ]\* 5.3 Write unit test: Accessibility label passthrough
        - Verify `NumericCell` passes its `accessibilityLabel` to the pressable element
        - _Requirements: 6.2_

- [x]   6. Final checkpoint
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (already in devDependencies) in `__tests__/cardCountPopover.property.test.tsx`
- Unit tests go in `__tests__/cardCountPopover.test.tsx`
- No changes to types, scoring engine, game logic, or store

# Implementation Plan: Origami Theme

## Overview

Incremental visual migration of the Sea Salt & Paper score tracker to an origami-inspired theme. The approach builds bottom-up: theme tokens first, then icons, then primitives, then shared components, then screens, and finally the root layout. Each step builds on the previous and ends with wiring into the existing app. No game logic or state changes.

## Tasks

- [x]   1. Create the centralized theme file
    - [x] 1.1 Create `src/theme/theme.ts` with `colors`, `spacing`, `typography`, `foldEffect`, and `foldEffectElevated` exports
        - Export `colors` object with all 13 required tokens: `background`, `surface`, `surfaceAlt`, `primary`, `primaryDark`, `accent`, `textPrimary`, `textSecondary`, `textOnPrimary`, `border`, `borderLight`, `error`, `success`
        - Export `spacing` object with `xs`, `sm`, `md`, `lg`, `xl` numeric values
        - Export `typography` object with `title`, `subtitle`, `body`, `caption`, `label` presets each containing `fontSize`, `fontWeight`, `color`
        - Export `foldEffect` and `foldEffectElevated` shadow objects
        - Use `as const` assertions for type safety
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

    - [ ]\* 1.2 Write property test for theme typography completeness (Property 1)
        - **Property 1: Typography presets are complete**
        - **Validates: Requirements 1.4**

- [x]   2. Create the origami SVG icon set
    - [x] 2.1 Install `react-native-svg` dependency and create `src/theme/icons/` directory with all 13 icon components
        - Create `CrabIcon.tsx`, `BoatIcon.tsx`, `FishIcon.tsx`, `ShellIcon.tsx`, `OctopusIcon.tsx`, `PenguinIcon.tsx`, `SailorIcon.tsx`, `MermaidIcon.tsx`, `SharkSwimmerIcon.tsx`, `TrophyIcon.tsx`, `DiceIcon.tsx`, `StopHandIcon.tsx`, `DeckIcon.tsx`
        - Each icon accepts `size` (default 24) and `color` (default `colors.textPrimary`) props
        - Each icon renders geometric, angular SVG paths using `react-native-svg` primitives
        - _Requirements: 2.1, 2.2, 2.3_

    - [x] 2.2 Create `src/theme/icons/index.ts` barrel export file
        - Re-export all 13 icon components from the barrel file
        - _Requirements: 2.1_

    - [ ]\* 2.3 Write property test for icon size and color props (Property 2)
        - **Property 2: All icons accept size and color with defaults**
        - **Validates: Requirements 2.2**

- [x]   3. Create FoldedCard and PaperButton primitives
    - [x] 3.1 Create `src/theme/FoldedCard.tsx`
        - Accept `children`, optional `variant` (`"default"` | `"elevated"`), and optional `style` props
        - Render children in a View with `colors.surface` background, `borderRadius: 12`, and `foldEffect` shadow
        - Include absolutely-positioned triangular corner fold decoration in top-right using border tricks
        - Apply `foldEffectElevated` when `variant="elevated"`
        - _Requirements: 3.1, 3.2, 3.3_

    - [x] 3.2 Create `src/theme/PaperButton.tsx`
        - Accept `title`, `onPress`, `variant` (`"primary"` | `"outline"`), `disabled`, and `accessibilityLabel` props
        - `"primary"` variant: `colors.primary` background, `colors.textOnPrimary` text, `foldEffect` shadow
        - `"outline"` variant: transparent background, `colors.border` border, `colors.primary` text
        - Disabled state: `opacity: 0.5`, press events prevented
        - Press feedback via `TouchableOpacity` with `activeOpacity={0.7}`
        - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

    - [ ]\* 3.3 Write property test for FoldedCard surface styling (Property 3)
        - **Property 3: FoldedCard applies surface styling to any children**
        - **Validates: Requirements 3.1**

    - [ ]\* 3.4 Write property test for FoldedCard elevated variant (Property 4)
        - **Property 4: FoldedCard elevated variant has stronger shadow**
        - **Validates: Requirements 3.3**

    - [ ]\* 3.5 Write property test for PaperButton variant rendering (Property 5)
        - **Property 5: PaperButton renders correctly for all valid prop combinations**
        - **Validates: Requirements 4.1, 4.2**

    - [ ]\* 3.6 Write property test for PaperButton disabled state (Property 6)
        - **Property 6: PaperButton disabled state prevents interaction**
        - **Validates: Requirements 4.3**

- [ ]   4. Checkpoint - Verify theme foundation
    - Ensure all tests pass, ask the user if questions arise.

- [x]   5. Migrate shared components to use theme tokens
    - [x] 5.1 Migrate `src/components/NumericCell.tsx` to use theme tokens
        - Replace hardcoded `#b0c8e8`, `#f8fbff`, `#1a3a5c` with `colors.border`, `colors.surface`, `colors.textPrimary`
        - _Requirements: 9.2_

    - [x] 5.2 Migrate `src/components/MultiplierToggle.tsx` to use theme tokens
        - Replace hardcoded colors with `colors.primary`, `colors.surface`, `colors.textSecondary`, `colors.textOnPrimary`
        - _Requirements: 9.3_

    - [x] 5.3 Migrate `src/components/CardCountPopover.tsx` to use theme tokens
        - Replace backdrop, card container, and button colors with Origami_Palette tokens
        - _Requirements: 9.1_

    - [x] 5.4 Migrate `src/components/ScoreTable.tsx` to use theme tokens and SVG icons
        - Replace category header emoji (🦀, 🐚, 🧜) with `CrabIcon`, `ShellIcon`, `MermaidIcon`
        - Replace all hardcoded colors with theme tokens
        - _Requirements: 9.4, 2.4_

    - [x] 5.5 Migrate `src/components/BreakdownModal.tsx` to use theme tokens and SVG icons
        - Replace 🎲 emoji with `DiceIcon` component
        - Replace hardcoded colors in overlay, header, body, and dividers with theme tokens
        - _Requirements: 9.5, 2.4_

- [x]   6. Migrate Player Setup screen (`app/index.tsx`)
    - Replace root background `#f0f6ff` with `colors.background`
    - Replace player count toggles and Start Game button with `PaperButton` components
    - Style TextInput fields with `colors.surface` background, `colors.border` border, `colors.textPrimary` text
    - Style title with `typography.title` and subtitle with `typography.subtitle`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x]   7. Migrate Scoreboard screen (`app/scoreboard.tsx`)
    - Replace root background with `colors.background`
    - Replace emoji in round-end labels (✋, 🎲, 🃏, 🏆) with `StopHandIcon`, `DiceIcon`, `DeckIcon`, `TrophyIcon`
    - Replace Add Round, View Results, and New Game buttons with `PaperButton` components
    - Style game-over banner with `colors.primary` background and `colors.textOnPrimary` text
    - Style score table header, data rows, and highlighted row with theme tokens
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]   8. Checkpoint - Verify shared components and first two screens
    - Ensure all tests pass, ask the user if questions arise.

- [x]   9. Migrate Score Entry screen (`app/score-entry.tsx`)
    - Replace root background with `colors.background`
    - Replace round-end-type toggles, caller selection buttons, and Submit Round button with `PaperButton` components
    - Wrap Last Chance step boxes in `FoldedCard` components
    - Style caller badge with `colors.surfaceAlt` background and `colors.primary` text
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x]   10. Migrate Game Over screen (`app/game-over.tsx`)
    - Replace root background with `colors.background`
    - Replace 🏆 emoji with `TrophyIcon` at large display size
    - Replace 🧜‍♀️ emoji with `MermaidIcon` in mermaid win badge
    - Replace View Scoreboard and New Game buttons with `PaperButton` components
    - Wrap final scores list in `FoldedCard` component
    - Style winner highlight row with `colors.accent` tones instead of `#fff8dc`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x]   11. Migrate root layout (`app/_layout.tsx`)
    - Replace `#f0f6ff` in `outerContainer` and loading screen with `colors.background`
    - _Requirements: 10.1, 10.2_

- [ ]   12. Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- No game logic, state management, or navigation changes — purely visual migration
- `react-native-svg` may need to be explicitly installed if not already bundled with Expo

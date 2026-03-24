# Requirements Document

## Introduction

Replace the plain numeric text inputs in the score-entry screen with a popover-based number picker. When a user taps or clicks on a card count input cell, a popover appears displaying selectable numbers from 0 to the maximum count of that card type in the Sea Salt Paper deck. This removes the need for keyboard input and prevents out-of-range values.

## Glossary

- **Popover**: A floating UI element that appears anchored to the input cell when tapped, displaying a grid of selectable numbers
- **NumericCell**: The existing table cell component used for entering card counts in the score-entry screen
- **Card_Count_Popover**: The new popover component that replaces keyboard-based numeric input
- **Deck_Max**: The maximum number of a given card type that exists in the Sea Salt Paper deck
- **Score_Entry_Screen**: The screen (`app/score-entry.tsx`) where players enter card breakdowns per round

## Deck Composition (Reference)

| Card Type          | Deck Max |
| ------------------ | -------- |
| Crabs              | 9        |
| Boats              | 8        |
| Fish               | 7        |
| Swimmer+Shark      | 10       |
| Shells             | 6        |
| Octopus            | 5        |
| Penguins           | 3        |
| Sailors            | 2        |
| Mermaids           | 4        |
| Mermaid Color Ct   | 9        |
| Multiplier Boat    | 1        |
| Multiplier Fish    | 1        |
| Multiplier Penguin | 1        |
| Multiplier Sailor  | 1        |

## Requirements

### Requirement 1: Popover Trigger on Input Tap

**User Story:** As a player, I want to tap on a card count cell and see a popover with valid numbers, so that I can select a value without using the keyboard.

#### Acceptance Criteria

1. WHEN a user taps on a NumericCell, THE Card_Count_Popover SHALL appear anchored to that cell
2. WHEN the Card_Count_Popover is open, THE Card_Count_Popover SHALL display selectable numbers from 0 to the Deck_Max for that card type
3. WHEN a user taps on a number in the Card_Count_Popover, THE Card_Count_Popover SHALL set the cell value to the selected number and close the popover
4. WHEN a user taps outside the Card_Count_Popover, THE Card_Count_Popover SHALL close without changing the cell value

### Requirement 2: Correct Max Values Per Card Type

**User Story:** As a player, I want the popover to only show numbers that are valid for each card type, so that I cannot enter impossible values.

#### Acceptance Criteria

1. THE Card_Count_Popover SHALL display numbers 0 through 9 for crabs
2. THE Card_Count_Popover SHALL display numbers 0 through 8 for boats
3. THE Card_Count_Popover SHALL display numbers 0 through 7 for fish
4. THE Card_Count_Popover SHALL display numbers 0 through 10 for swimmer+shark combos
5. THE Card_Count_Popover SHALL display numbers 0 through 6 for shells
6. THE Card_Count_Popover SHALL display numbers 0 through 5 for octopus
7. THE Card_Count_Popover SHALL display numbers 0 through 3 for penguins
8. THE Card_Count_Popover SHALL display numbers 0 through 2 for sailors
9. THE Card_Count_Popover SHALL display numbers 0 through 4 for mermaid count
10. THE Card_Count_Popover SHALL display numbers 0 through 9 for each mermaid color count

### Requirement 3: Visual Feedback for Current Selection

**User Story:** As a player, I want to see which number is currently selected in the popover, so that I know the current value before changing it.

#### Acceptance Criteria

1. WHEN the Card_Count_Popover opens, THE Card_Count_Popover SHALL visually highlight the currently selected number
2. THE Card_Count_Popover SHALL display numbers in a compact grid layout that fits within the screen bounds

### Requirement 4: Cross-Platform Compatibility

**User Story:** As a player, I want the popover to work on both mobile (iOS/Android) and web, so that I have a consistent experience across platforms.

#### Acceptance Criteria

1. THE Card_Count_Popover SHALL function on iOS, Android, and web platforms
2. WHEN running on web, THE Card_Count_Popover SHALL respond to both click and tap events
3. THE Card_Count_Popover SHALL position itself within the visible screen area to avoid clipping

### Requirement 5: Popover Replaces Keyboard Input for Card Counts

**User Story:** As a player, I want the popover to fully replace the keyboard-based text input for card counts, so that the input method is consistent and error-proof.

#### Acceptance Criteria

1. THE NumericCell SHALL open the Card_Count_Popover on press instead of activating a keyboard text input
2. THE NumericCell SHALL display the current numeric value as read-only text when the popover is closed
3. WHEN a value is selected via the Card_Count_Popover, THE Score_Entry_Screen SHALL update the card breakdown and recalculate the score immediately

### Requirement 6: Accessibility

**User Story:** As a player using assistive technology, I want the popover to be accessible, so that I can use the score entry feature effectively.

#### Acceptance Criteria

1. THE Card_Count_Popover SHALL provide appropriate accessibility roles and labels for each selectable number
2. THE NumericCell SHALL retain its existing accessibility label describing the card type and player name

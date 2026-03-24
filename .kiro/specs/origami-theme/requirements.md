# Requirements Document

## Introduction

Visual overhaul of the Sea Salt & Paper score tracker app to adopt an origami art style consistent with the board game's aesthetic. This includes replacing all emoji with bespoke origami-style SVG icons, restyling UI elements to evoke folded paper, adopting a warmer ocean/parchment color palette, and providing reusable theme primitives for incremental screen migration.

## Glossary

- **Theme_File**: A centralized TypeScript module (`src/theme/theme.ts`) exporting color tokens, spacing values, typography scales, and shadow/fold visual constants used across the app
- **SVG_Icon_Set**: A collection of origami-style SVG icon components rendered via `react-native-svg`, each exported from `src/theme/icons/`
- **FoldedCard**: A reusable wrapper component that renders its children inside a container styled to resemble a folded piece of paper (subtle shadow, angled corner, parchment background)
- **PaperButton**: A reusable button component styled with a folded-paper aesthetic (paper texture background, crease-line border, pressed state that simulates unfolding)
- **Origami_Palette**: The warm color palette derived from the Sea Salt & Paper board game — ocean blues, sandy tans, coral accents, and parchment whites
- **Screen**: One of the four app routes: Player Setup, Scoreboard, Score Entry, or Game Over
- **Component**: One of the extracted shared UI elements: CardCountPopover, NumericCell, MultiplierToggle, ScoreTable, or BreakdownModal
- **Fold_Effect**: A CSS/style treatment using shadows, gradients, or border tricks to simulate a paper fold or crease on a UI element

## Requirements

### Requirement 1: Origami Color Palette Theme File

**User Story:** As a developer, I want a centralized theme file with the origami color palette, so that all screens and components can reference consistent design tokens.

#### Acceptance Criteria

1. THE Theme_File SHALL export a `colors` object containing at minimum: `background`, `surface`, `surfaceAlt`, `primary`, `primaryDark`, `accent`, `textPrimary`, `textSecondary`, `textOnPrimary`, `border`, `borderLight`, `error`, and `success` tokens
2. THE Theme_File SHALL use Origami_Palette values — ocean blues for primary, sandy tan for surface, parchment white for background, and coral for accent
3. THE Theme_File SHALL export a `spacing` scale object with at minimum `xs`, `sm`, `md`, `lg`, and `xl` numeric values
4. THE Theme_File SHALL export a `typography` object with `title`, `subtitle`, `body`, `caption`, and `label` presets each containing `fontSize`, `fontWeight`, and `color` properties
5. THE Theme_File SHALL export a `foldEffect` object containing `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation` values that simulate a paper fold shadow

### Requirement 2: Origami SVG Icon Set

**User Story:** As a user, I want to see origami-style icons instead of emoji, so that the app visually matches the Sea Salt & Paper board game art style.

#### Acceptance Criteria

1. THE SVG_Icon_Set SHALL include individual icon components for: Crab, Boat, Fish, Shell, Octopus, Penguin, Sailor, Mermaid, SharkSwimmer, Trophy, Dice, StopHand, and Deck
2. WHEN an SVG icon component is rendered, THE SVG_Icon_Set component SHALL accept `size` and `color` props with sensible defaults
3. THE SVG_Icon_Set SHALL render each icon using `react-native-svg` primitives (Svg, Path, G, etc.) with geometric, angular line work evoking folded paper
4. WHEN an icon replaces an existing emoji, THE Screen or Component SHALL render the corresponding SVG_Icon_Set component in place of the emoji text character

### Requirement 3: FoldedCard Reusable Primitive

**User Story:** As a developer, I want a FoldedCard component, so that I can wrap content in a consistent origami-styled container across all screens.

#### Acceptance Criteria

1. THE FoldedCard SHALL render its children inside a View with Origami_Palette `surface` background color, rounded corners, and Fold_Effect shadow
2. THE FoldedCard SHALL display a triangular corner fold decoration in one corner using an absolutely-positioned element
3. THE FoldedCard SHALL accept an optional `variant` prop with values `"default"` and `"elevated"`, where `"elevated"` applies a stronger Fold_Effect shadow
4. WHEN used on any Screen, THE FoldedCard SHALL visually replace the current plain white card containers (e.g., `lastChanceStepBox`, `colorBonusRow`, `scoreTableContainer`)

### Requirement 4: PaperButton Reusable Primitive

**User Story:** As a developer, I want a PaperButton component, so that all buttons in the app share a consistent origami-styled appearance.

#### Acceptance Criteria

1. THE PaperButton SHALL accept `title`, `onPress`, `variant`, `disabled`, and standard accessibility props
2. THE PaperButton SHALL support `variant` values of `"primary"` (filled with Origami_Palette primary color) and `"outline"` (bordered with transparent background)
3. WHEN the PaperButton is in the `disabled` state, THE PaperButton SHALL reduce opacity and prevent press events
4. THE PaperButton SHALL apply a subtle Fold_Effect shadow to simulate a raised paper surface
5. WHEN the PaperButton is pressed, THE PaperButton SHALL provide visual feedback via opacity change or scale animation

### Requirement 5: Player Setup Screen Migration

**User Story:** As a user, I want the Player Setup screen to use the origami theme, so that the first screen I see matches the game's art style.

#### Acceptance Criteria

1. WHEN the Player Setup Screen renders, THE Screen SHALL use Origami_Palette `background` as the root background color instead of the current `#f0f6ff`
2. WHEN the Player Setup Screen renders, THE Screen SHALL use PaperButton components for the player count toggles and the Start Game button
3. WHEN the Player Setup Screen renders, THE Screen SHALL style TextInput fields with Origami_Palette `surface` background, `border` border color, and `textPrimary` text color
4. THE Player Setup Screen SHALL display the app title "Sea Salt & Paper" using Theme_File `typography.title` styling

### Requirement 6: Scoreboard Screen Migration

**User Story:** As a user, I want the Scoreboard screen to use the origami theme, so that the score table feels like a paper scoresheet.

#### Acceptance Criteria

1. WHEN the Scoreboard Screen renders, THE Screen SHALL use Origami_Palette `background` as the root background color
2. WHEN the Scoreboard Screen renders, THE Screen SHALL replace all emoji in round-end labels (✋, 🎲, 🃏, 🏆) with corresponding SVG_Icon_Set components (StopHand, Dice, Deck, Trophy)
3. WHEN the Scoreboard Screen renders, THE Screen SHALL use PaperButton components for Add Round, View Results, and New Game buttons
4. THE Scoreboard Screen SHALL style the game-over banner using Origami_Palette `primary` background and `textOnPrimary` text color
5. THE Scoreboard Screen SHALL style the score table header row, data rows, and highlighted row using Origami_Palette tokens

### Requirement 7: Score Entry Screen Migration

**User Story:** As a user, I want the Score Entry screen to use the origami theme, so that entering card counts feels immersive.

#### Acceptance Criteria

1. WHEN the Score Entry Screen renders, THE Screen SHALL use Origami_Palette `background` as the root background color
2. WHEN the Score Entry Screen renders, THE Screen SHALL replace the category header emoji (🦀, 🐚, 🧜) with corresponding SVG_Icon_Set components (Crab, Shell, Mermaid)
3. WHEN the Score Entry Screen renders, THE Screen SHALL use PaperButton components for round-end-type toggles, caller selection buttons, and the Submit Round button
4. THE Score Entry Screen SHALL wrap the Last Chance step boxes in FoldedCard components
5. THE Score Entry Screen SHALL style the caller badge using Origami_Palette `surfaceAlt` background and `primary` text color

### Requirement 8: Game Over Screen Migration

**User Story:** As a user, I want the Game Over screen to use the origami theme, so that the victory celebration matches the game's aesthetic.

#### Acceptance Criteria

1. WHEN the Game Over Screen renders, THE Screen SHALL use Origami_Palette `background` as the root background color
2. WHEN the Game Over Screen renders, THE Screen SHALL replace the trophy emoji (🏆) with the SVG_Icon_Set Trophy component at a large display size
3. WHEN the Game Over Screen renders, THE Screen SHALL replace the mermaid emoji (🧜‍♀️) with the SVG_Icon_Set Mermaid component in the mermaid win badge
4. WHEN the Game Over Screen renders, THE Screen SHALL use PaperButton components for View Scoreboard and New Game buttons
5. THE Game Over Screen SHALL wrap the final scores list in a FoldedCard component
6. THE Game Over Screen SHALL style the winner highlight row using Origami_Palette `accent` tones instead of the current `#fff8dc`

### Requirement 9: Shared Component Theme Migration

**User Story:** As a developer, I want all shared components to use theme tokens, so that they automatically adopt the origami style when used on any screen.

#### Acceptance Criteria

1. THE CardCountPopover component SHALL style its backdrop, card container, and selection buttons using Origami_Palette tokens from the Theme_File
2. THE NumericCell component SHALL style its border, background, and text using Origami_Palette tokens from the Theme_File
3. THE MultiplierToggle component SHALL style its active and inactive states using Origami_Palette `primary` and `surface` tokens
4. THE ScoreTable component SHALL style category headers, row borders, and the score footer using Origami_Palette tokens from the Theme_File
5. THE BreakdownModal component SHALL style its overlay, header, body, and dividers using Origami_Palette tokens from the Theme_File

### Requirement 10: Layout Root Theme Integration

**User Story:** As a developer, I want the root layout to use the origami theme background, so that loading states and screen transitions use the correct palette.

#### Acceptance Criteria

1. THE RootLayout component SHALL use Origami_Palette `background` as the `outerContainer` background color instead of the current `#f0f6ff`
2. THE RootLayout component SHALL use Origami_Palette `background` as the loading screen background color

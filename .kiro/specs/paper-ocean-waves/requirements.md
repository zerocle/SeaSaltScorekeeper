# Requirements Document

## Introduction

The player setup screen (app/index.tsx) of the Sea Salt & Paper score tracker currently feels static and utilitarian. This feature adds animated paper-textured ocean waves to the bottom of the screen, reinforcing the game's nautical theme and the app's existing origami/paper aesthetic. The waves consist of multiple overlapping layers that sway gently, creating a sense of depth and movement without distracting from the interactive controls above.

## Glossary

- **Wave_Layer**: A single SVG path element rendered across the full width of the screen, shaped like an ocean wave crest, styled with a paper-like fill color from the app theme.
- **Wave_Animation**: A looping horizontal translation applied to a Wave_Layer using the React Native Animated API, creating a slow lateral swaying motion.
- **Wave_Container**: A View positioned at the bottom of the player setup screen that holds all Wave_Layers and sits behind the scrollable content.
- **Player_Setup_Screen**: The initial screen of the app (app/index.tsx) where users choose the number of players, enter names, and start a game.
- **Theme**: The centralized color and styling definitions in src/theme/theme.ts.

## Requirements

### Requirement 1: Wave Container Placement

**User Story:** As a player, I want to see ocean waves at the bottom of the setup screen, so that the app feels thematic and inviting.

#### Acceptance Criteria

1. THE Wave_Container SHALL render at the bottom of the Player_Setup_Screen, spanning the full width of the screen.
2. THE Wave_Container SHALL be positioned behind all interactive content (inputs, buttons) so that the waves never obstruct user interaction.
3. THE Wave_Container SHALL use absolute positioning anchored to the bottom edge of the screen.
4. THE Wave_Container SHALL have pointer events disabled so that touch events pass through to underlying controls.

### Requirement 2: Multiple Wave Layers

**User Story:** As a player, I want to see multiple overlapping wave shapes, so that the ocean effect has visual depth.

#### Acceptance Criteria

1. THE Wave_Container SHALL render at least three Wave_Layers stacked vertically with slight vertical offsets.
2. Each Wave_Layer SHALL use a distinct fill color derived from the Theme (e.g., variations of primary, primaryDark, and surfaceAlt) to create a sense of depth through color differentiation.
3. Wave_Layers closer to the foreground SHALL appear on top of Wave_Layers further in the background (higher z-index for front layers).
4. Each Wave_Layer SHALL span at least 150% of the screen width to allow horizontal translation without exposing gaps.

### Requirement 3: Wave Shape Rendering

**User Story:** As a player, I want the waves to look like stylized paper cutouts, so that they match the app's origami aesthetic.

#### Acceptance Criteria

1. Each Wave_Layer SHALL be rendered as an SVG path with smooth, curved crests resembling ocean waves.
2. THE Wave_Layer SVG paths SHALL use quadratic or cubic Bézier curves to produce organic wave shapes.
3. Each Wave_Layer SHALL have a distinct wave amplitude and frequency so that the layers do not look identical.

### Requirement 4: Swaying Animation

**User Story:** As a player, I want the waves to gently sway back and forth, so that the screen feels alive without being distracting.

#### Acceptance Criteria

1. Each Wave_Layer SHALL animate with a continuous horizontal translation that loops indefinitely.
2. THE Wave_Animation SHALL use the React Native Animated API with `useNativeDriver: true` for smooth 60fps performance.
3. Each Wave_Layer SHALL animate at a different speed and direction offset so that the layers move independently, avoiding a mechanical look.
4. THE Wave_Animation cycle duration SHALL be between 3 seconds and 8 seconds per layer to maintain a slow, calming pace.
5. THE Wave_Animation SHALL use an easing function that produces smooth sinusoidal-like motion (e.g., Animated.loop with easing in-out).

### Requirement 5: Performance

**User Story:** As a player, I want the wave animation to run smoothly on my phone, so that the app remains responsive.

#### Acceptance Criteria

1. THE Wave_Animation SHALL use `useNativeDriver: true` to offload animation to the native thread.
2. THE Wave_Container SHALL avoid triggering re-renders of the Player_Setup_Screen form controls during animation.
3. IF the Player_Setup_Screen unmounts, THEN THE Wave_Animation SHALL stop and release animation resources.

### Requirement 6: Theme Integration

**User Story:** As a player, I want the waves to match the app's existing color palette, so that the visual design feels cohesive.

#### Acceptance Criteria

1. THE Wave_Layer fill colors SHALL be sourced from or derived from values defined in the Theme (src/theme/theme.ts).
2. THE Wave_Container background SHALL remain transparent so that the Player_Setup_Screen background color shows through between wave crests.
3. THE Wave_Layers SHALL include subtle opacity variation (e.g., back layers more translucent) to reinforce the depth effect.

### Requirement 7: Responsive Layout

**User Story:** As a player, I want the waves to look correct on any screen size, so that the effect works on different devices.

#### Acceptance Criteria

1. THE Wave_Container SHALL adapt its width to the current screen dimensions using the React Native Dimensions API or useWindowDimensions hook.
2. THE Wave_Layer height SHALL scale proportionally so that waves occupy a consistent fraction of the screen (approximately the bottom 20-30%).
3. WHEN the device orientation or screen size changes, THE Wave_Container SHALL re-measure and adjust the wave dimensions accordingly.

# Requirements Document — Production Readiness

## Introduction

This spec covers the minimum work required to ship Sea Salt & Paper Scorer to the Google Play Store and Apple App Store. It focuses on three pillars: runtime error resilience (error boundaries + Sentry), build and submission configuration (EAS Build, app identifiers, store metadata), and input validation/sanitization (player names, especially on web). A set of fast-follow items is listed at the end for work that should land before launch but after the core spec is implemented.

## Glossary

- **App**: The Sea Salt & Paper Scorer Expo/React Native application
- **Error_Boundary**: A React component that catches JavaScript errors in its child component tree and renders a fallback UI instead of crashing
- **Sentry**: A third-party error-tracking service used to capture, report, and alert on runtime exceptions
- **EAS_Build**: Expo Application Services Build — a cloud build service that produces signed Android APK/AAB and iOS IPA binaries
- **EAS_Submit**: Expo Application Services Submit — a CLI tool that uploads built binaries to the Google Play Store and Apple App Store
- **Player_Name_Input**: The TextInput fields on the Player Setup screen where users enter player names
- **Validator**: A pure function module that checks player name strings against defined rules and returns sanitized output
- **Root_Layout**: The top-level `app/_layout.tsx` component that wraps all screens
- **Game_Store**: The Zustand store (`src/store/gameStore.ts`) managing game session state and persistence

## Requirements

### Requirement 1: Root Error Boundary

**User Story:** As a player, I want the app to show a friendly recovery screen instead of crashing, so that I can continue using the app after an unexpected error.

#### Acceptance Criteria

1. THE Root_Layout SHALL wrap all child screens in an Error_Boundary component
2. WHEN a JavaScript error is thrown in any child component, THE Error_Boundary SHALL catch the error and render a fallback UI containing an error message and a "Try Again" button
3. WHEN the user presses the "Try Again" button, THE Error_Boundary SHALL reset its error state and re-render the child component tree
4. IF the Error_Boundary catches an error and the Game_Store state is corrupted, THEN THE Error_Boundary SHALL call `newGame()` to reset state before re-rendering

### Requirement 2: Sentry Error Tracking

**User Story:** As a developer, I want runtime errors reported to Sentry, so that I can monitor crashes and fix issues after release.

#### Acceptance Criteria

1. THE App SHALL initialize the `@sentry/react-native` SDK during startup with a configurable DSN read from Expo environment variables
2. WHEN the Error_Boundary catches an error, THE Error_Boundary SHALL report the error to Sentry via `Sentry.captureException`
3. WHEN an unhandled promise rejection occurs, THE Sentry SDK SHALL capture the rejection automatically
4. WHILE the App is running in development mode (`__DEV__ === true`), THE Sentry SDK SHALL remain disabled to avoid polluting production error data
5. THE App SHALL attach the app version string from `expo-constants` to every Sentry event as a release tag

### Requirement 3: EAS Build Configuration

**User Story:** As a developer, I want a working EAS Build configuration, so that I can produce signed builds for both app stores.

#### Acceptance Criteria

1. THE App SHALL include an `eas.json` file with three build profiles: `development`, `preview`, and `production`
2. THE `production` build profile SHALL target the `release` variant for Android and the `Release` configuration for iOS
3. THE `development` build profile SHALL enable the `developmentClient` flag
4. THE App SHALL set the Android package identifier to a real reverse-domain name (replacing `com.anonymous.seasaltpaperscorer`) in `app.json`
5. THE App SHALL set the iOS bundle identifier in `app.json`
6. THE `app.json` SHALL include a `runtimeVersion` policy set to `"appVersion"` for OTA update compatibility

### Requirement 4: App Store Metadata Preparation

**User Story:** As a developer, I want all required store metadata configured, so that the app can pass store review.

#### Acceptance Criteria

1. THE `app.json` SHALL specify an `ios.buildNumber` starting at `"1"`
2. THE `app.json` SHALL specify an `android.versionCode` starting at `1`
3. THE `app.json` SHALL include a `privacy-policy` URL in the `ios.infoPlist` under `NSPrivacyManifest` or as a standalone config field for store submission
4. THE `app.json` SHALL set `ios.supportsTablet` to `true`
5. THE `app.json` SHALL configure `android.permissions` as an empty array (the app requires no special permissions)

### Requirement 5: Player Name Input Validation

**User Story:** As a player, I want clear feedback when I enter an invalid name, so that I can correct it before starting a game.

#### Acceptance Criteria

1. THE Validator SHALL reject player names shorter than 1 character or longer than 20 characters after trimming whitespace
2. THE Validator SHALL reject player names that are identical to another player's name (case-insensitive comparison after trimming)
3. WHEN a player name fails validation, THE Player_Name_Input SHALL display an inline error message below the input field describing the violation
4. WHILE any player name fails validation, THE "Start Game" button SHALL remain disabled
5. THE Validator SHALL be a pure function that accepts an array of name strings and returns a per-name array of error messages (empty string for valid names)

### Requirement 6: Player Name Sanitization (Web)

**User Story:** As a developer, I want player name inputs sanitized on web, so that stored names cannot contain HTML or script content.

#### Acceptance Criteria

1. WHEN a player name is submitted on any platform, THE Validator SHALL strip leading and trailing whitespace from the name
2. WHEN a player name is submitted on web, THE Validator SHALL strip HTML tags from the input before storing the name
3. THE Validator SHALL collapse consecutive internal whitespace characters in a player name to a single space
4. FOR ALL valid player names, sanitizing a name and then sanitizing the result again SHALL produce an identical string (idempotence property)

---

## Fast-Follow Items

The following items should be completed before public launch but are lower priority than the core requirements above. They are documented here for tracking and should be specced separately.

### Fast-Follow 1: Accessibility Pass

- Screen reader labels and roles for all interactive elements
- Focus management on screen transitions (especially modals and dialogs)
- Color contrast audit against WCAG 2.1 AA for all text and interactive elements
- Keyboard navigation support on web

### Fast-Follow 2: Analytics / Event Tracking

- Lightweight analytics integration (Mixpanel, Firebase Analytics, or similar)
- Key events: game started, game completed, round submitted, mermaid win declared, history viewed
- No PII collection — track event counts and anonymous session data only

### Fast-Follow 3: Deployment Automation

- GitHub Actions workflow for EAS Build + EAS Submit on tagged releases
- Separate lanes for Android (Play Store) and iOS (App Store Connect)
- Build artifact caching and status badge in README

### Fast-Follow 4: Error Scenario E2E Tests

- Maestro flows for corrupted persisted state recovery
- Maestro flows for storage write failure graceful degradation
- Maestro flows verifying error boundary fallback UI renders and recovers

### Fast-Follow 5: Deployment Guide and Troubleshooting Documentation

- Step-by-step guide for first-time EAS Build setup (credentials, signing keys)
- App store submission checklist (screenshots, descriptions, categories)
- Troubleshooting section for common build and submission errors

### Fast-Follow 6: String Externalization (i18n Readiness)

- Extract all hardcoded UI strings from components and screens into a centralized location (e.g. `src/i18n/en.ts` or JSON resource files)
- Adopt a translation-ready pattern (e.g. `i18next` + `react-i18next`, or a lightweight key-lookup module) so strings are referenced by key rather than inlined
- Organize string keys by screen/feature namespace to keep the file manageable as the app grows
- Ensure pluralization and interpolation patterns are supported (e.g. "Round {{number}}", "{{count}} players")
- No actual translations required in this phase — English-only is fine; the goal is structural readiness

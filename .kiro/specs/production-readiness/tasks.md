# Implementation Plan: Production Readiness

## Overview

Implement production readiness features in six areas: player name validation/sanitization module, ErrorBoundary component with Sentry integration, EAS build configuration, and app store metadata. The validator module is built first since it's pure logic with strong PBT coverage, followed by the error boundary (which depends on Sentry), then declarative config changes.

## Tasks

- [x]   1. Create the player name validator module
    - [x] 1.1 Create `src/validation/playerNameValidator.ts` with `sanitizePlayerName()` and `validatePlayerNames()`
        - `sanitizePlayerName(name)`: strip HTML tags via regex, trim leading/trailing whitespace, collapse consecutive internal whitespace to single space
        - `validatePlayerNames(names)`: sanitize each name, check length 1-20, detect case-insensitive duplicates, return parallel array of error strings (empty string = valid)
        - Error messages: `"Name is required"`, `"Name must be 20 characters or less"`, `"Name is already taken"`
        - _Requirements: 5.1, 5.2, 5.5, 6.1, 6.2, 6.3, 6.4_

    - [x] 1.2 Write property test: Name length validation (Property 1)
        - **Property 1: Name length validation**
        - Generate arbitrary strings via `fc.string()`, sanitize, check length, assert `validatePlayerNames([s])` returns error iff sanitized length < 1 or > 20
        - Test file: `src/__tests__/playerNameValidator.property.test.ts`
        - **Validates: Requirements 5.1**

    - [x] 1.3 Write property test: Duplicate name detection (Property 2)
        - **Property 2: Duplicate name detection**
        - Generate arrays where at least two names are case-insensitively equal after sanitization; assert validator flags duplicates
        - Test file: `src/__tests__/playerNameValidator.property.test.ts`
        - **Validates: Requirements 5.2**

    - [x] 1.4 Write property test: Validator output length invariant (Property 3)
        - **Property 3: Validator output length invariant**
        - Generate arrays of 2-4 strings; assert output array length equals input array length
        - Test file: `src/__tests__/playerNameValidator.property.test.ts`
        - **Validates: Requirements 5.5**

    - [x] 1.5 Write property test: Sanitization output format (Property 4)
        - **Property 4: Sanitization output format**
        - Generate arbitrary strings (including `<`, `>`, multiple spaces, leading/trailing whitespace); assert sanitized output has no leading/trailing whitespace, no HTML tags, no consecutive spaces
        - Test file: `src/__tests__/playerNameValidator.property.test.ts`
        - **Validates: Requirements 6.1, 6.2, 6.3**

    - [x] 1.6 Write property test: Sanitization idempotence (Property 5)
        - **Property 5: Sanitization idempotence**
        - Generate arbitrary strings; assert `sanitizePlayerName(sanitizePlayerName(s)) === sanitizePlayerName(s)`
        - Test file: `src/__tests__/playerNameValidator.property.test.ts`
        - **Validates: Requirements 6.4**

    - [x] 1.7 Write unit tests for validator edge cases
        - Test file: `src/__tests__/playerNameValidator.test.ts`
        - Cases: empty string, whitespace-only, exactly 20 chars, exactly 21 chars, names with HTML tags, mixed-case duplicates, single valid name
        - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3_

- [x]   2. Checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x]   3. Integrate validation into PlayerSetupScreen
    - [x] 3.1 Wire `sanitizePlayerName()` and `validatePlayerNames()` into `app/index.tsx`
        - Import from `src/validation/playerNameValidator`
        - Call `sanitizePlayerName()` on each name in `handleNameChange` (or on submit)
        - Call `validatePlayerNames()` on the names array to compute per-field error messages
        - Replace existing `areAllNamesValid()` usage with the new validator (disable "Start Game" when any error is non-empty)
        - Display inline error `<Text>` below each `TextInput` when error string is non-empty
        - Pass sanitized names to `createGame()` on submit
        - _Requirements: 5.3, 5.4_

- [x]   4. Add Sentry SDK and ErrorBoundary
    - [x] 4.1 Install `@sentry/react-native` and initialize in `app/_layout.tsx`
        - Add `@sentry/react-native` as a dependency
        - Add Sentry init block gated behind `!__DEV__` at the top of `app/_layout.tsx`
        - Read DSN from `Constants.expoConfig?.extra?.sentryDsn`
        - Attach app version as release tag via `Constants.expoConfig?.version`
        - Add `"extra": { "sentryDsn": "" }` placeholder to `app.json`
        - _Requirements: 2.1, 2.3, 2.4, 2.5_

    - [x] 4.2 Create `src/components/ErrorBoundary.tsx` class component
        - Implement `getDerivedStateFromError` to set `hasError: true`
        - Implement `componentDidCatch` to call `Sentry.captureException(error)` when Sentry is enabled
        - In `componentDidCatch`, check if `useGameStore.getState().gameSession` is corrupted (e.g. missing `players` array) and call `newGame()` if so
        - Implement `handleReset` to set `hasError: false`
        - Render fallback UI with error message and "Try Again" `PaperButton`
        - _Requirements: 1.2, 1.3, 1.4, 2.2_

    - [x] 4.3 Wrap all screens in ErrorBoundary in `app/_layout.tsx`
        - Wrap the `<Stack>` navigator inside `<ErrorBoundary>` in the `RootLayout` component
        - _Requirements: 1.1_

    - [x] 4.4 Write component tests for ErrorBoundary
        - Test file: `src/components/__tests__/ErrorBoundary.component.test.tsx`
        - Test: child throws → fallback UI renders with error message and "Try Again" button
        - Test: pressing "Try Again" resets error state and re-renders children
        - Test: `Sentry.captureException` is called when error is caught (mock `@sentry/react-native`)
        - Test: `newGame()` is called when game store state is corrupted
        - Test: Sentry.init is not called when `__DEV__` is true
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.4_

- [x]   5. Checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [x]   6. Configure EAS Build and app store metadata
    - [x] 6.1 Create `eas.json` with development, preview, and production build profiles
        - `development`: `developmentClient: true`, `distribution: "internal"`
        - `preview`: `distribution: "internal"`
        - `production`: `autoIncrement: true`
        - Include `submit.production` block and CLI version constraint
        - _Requirements: 3.1, 3.2, 3.3_

    - [x] 6.2 Update `app.json` with real identifiers, version codes, permissions, and runtime version
        - Set `android.package` to `dev.seasaltpaper.scorer`
        - Add `ios.bundleIdentifier` as `dev.seasaltpaper.scorer`
        - Add `ios.buildNumber` as `"1"`
        - Add `android.versionCode` as `1`
        - Set `android.permissions` to `[]`
        - Add `ios.infoPlist.ITSAppUsesNonExemptEncryption` as `false`
        - Add `runtimeVersion` with `policy: "appVersion"`
        - Ensure `ios.supportsTablet` remains `true`
        - _Requirements: 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x]   7. Final checkpoint — Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The validator module is built first because it's pure logic with no dependencies, enabling early PBT coverage
- Sentry DSN is a placeholder — set via environment variable in CI/EAS build

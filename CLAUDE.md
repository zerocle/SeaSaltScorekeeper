# SeaSalt Scorekeeper — Claude Guidelines

## Before every commit and push

Run all three of these steps in order. Do not skip any, even for small changes.

### 1. Format with Prettier

```bash
npm run format
```

This formats all files under `app/` and `src/`. If you only touched specific files you can run `npx prettier --write <file>` directly, but `npm run format` is the safe default.

### 2. Run both test suites

```bash
npm test                          # unit tests (src/)
npm run test:components           # component/screen tests (src/ + app/)
```

Both must pass with zero failures before committing.

### 3. Write tests for anything new

Every new component or screen must have a corresponding test file before the commit lands:

- New component in `src/components/Foo.tsx` → `src/components/__tests__/Foo.component.test.tsx`
- New screen in `app/foo.tsx` → `app/__tests__/foo.component.test.tsx`
- New pure logic in `src/` → `src/__tests__/<name>.test.ts`

Tests should cover the meaningful behaviours of the unit: rendering, user interactions, edge cases, and error states. Look at existing test files for the conventions used in this project.

## Project structure

```
app/               # Expo Router screens (file-based routing)
src/
  components/      # Reusable React Native components
  store/           # Zustand stores (gameStore, settingsStore)
  theme/           # Colors, typography, spacing, icons
  validation/      # Input sanitisation and validation
  types.ts         # Shared TypeScript interfaces
  scoringEngine.ts # Card scoring logic
  gameLogic.ts     # Win condition and round logic
__mocks__/         # Jest mocks for react-native, expo-router, etc.
jest.config.js              # Unit test config (src/ only, ts-jest)
jest.config.components.js   # Component test config (src/ + app/, jest-expo)
```

## Test configs

| Config | Scope | Pattern | Runner |
|---|---|---|---|
| `jest.config.js` | `src/` | `*.test.ts(x)` | `ts-jest` |
| `jest.config.components.js` | `src/` + `app/` | `*.component.test.tsx` | `jest-expo` |

The component config uses `jest-expo` with real React Native transforms. The unit config uses the lightweight `__mocks__/react-native.js` mock — if a component uses a React Native primitive that isn't in that mock, add it there.

## TypeScript

```bash
npx tsc --noEmit
```

The project must type-check cleanly. Run this if you make interface or type changes.

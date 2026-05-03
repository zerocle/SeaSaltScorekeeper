# SeaSalt Scorekeeper — Claude Guidelines

## Before starting any new task

Pull main to make sure you are working from the latest code:

```bash
git fetch origin
git pull origin main
```

If you are already on a feature branch, rebase or merge main into it before making changes:

```bash
git merge origin/main
```

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

## Before creating a pull request

Run all of the following checks in order. Every check must pass before opening the PR.

```bash
# 1. Format
npm run format

# 2. Type check
npx tsc --noEmit

# 3. Dead code check
npm run check:deadcode

# 4. Unit tests with coverage enforcement
npm run test:coverage

# 5. Component tests
npm run test:components
```

If any check fails, fix the issue before creating the PR. Do not open a PR with failing checks.

## TypeScript

```bash
npx tsc --noEmit
```

The project must type-check cleanly. Run this if you make interface or type changes.

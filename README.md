# Sea Salt Scorekeeper

A mobile score-tracking app for the [Sea Salt & Paper](https://boardgamegeek.com/boardgame/367220/sea-salt-paper) card game. Built with Expo and React Native, it handles player setup, round-by-round score entry with card-category breakdowns, multiplier bonuses, and automatic winner detection.

## Tech Stack

| Technology   | Version |
| ------------ | ------- |
| Expo SDK     | 54      |
| React Native | 0.81.5  |
| React        | 19.1    |
| TypeScript   | 5.8     |
| Zustand      | 5.x     |

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- npm (included with Node.js)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo` — no global install required)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/sea-salt-paper-scorer.git
cd sea-salt-paper-scorer

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `w` to open in a web browser.

## Available Scripts

| Script            | Command                                   | Description                       |
| ----------------- | ----------------------------------------- | --------------------------------- |
| `start`           | `expo start`                              | Start the Expo development server |
| `test`            | `jest`                                    | Run unit and property-based tests |
| `test:components` | `jest --config jest.config.components.js` | Run component tests               |
| `test:e2e`        | `maestro test e2e/`                       | Run end-to-end tests via Maestro  |

## Project Structure

```
├── app/            # Expo Router screens (layout, index, score-entry, scoreboard, etc.)
├── src/            # Core application logic
│   ├── components/ # Reusable React Native components
│   ├── store/      # Zustand state management and persistence
│   ├── theme/      # Styling constants and theme definitions
│   ├── gameLogic.ts
│   ├── scoringEngine.ts
│   ├── deckLimits.ts
│   ├── persistence.ts
│   ├── types.ts
│   └── utils.ts
├── e2e/            # Maestro end-to-end test flows (YAML)
├── assets/         # App icons, splash screen, and static images
├── .github/        # GitHub Actions CI workflow
└── package.json
```

## Testing

The project uses three layers of testing:

### Unit & Property-Based Tests

Run the core logic tests (scoring engine, game logic, deck limits, utilities):

```bash
npm test
```

These tests live alongside source files in `src/__tests__/` and use [fast-check](https://github.com/dubzzz/fast-check) for property-based testing.

### Component Tests

Run React Native component tests with Testing Library:

```bash
npm run test:components
```

Component tests are located in `src/components/__tests__/` and `app/__tests__/`.

### End-to-End Tests

Run full user-flow tests using [Maestro](https://maestro.mobile.dev/):

```bash
npm run test:e2e
```

E2E test flows are defined as YAML files in the `e2e/` directory. See [`e2e/README.md`](e2e/README.md) for details.

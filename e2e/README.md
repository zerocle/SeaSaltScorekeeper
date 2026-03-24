# E2E Tests (Maestro)

End-to-end UI tests using [Maestro](https://maestro.mobile.dev/).

## Setup

1. Install Maestro CLI:

    ```bash
    # macOS / Linux
    curl -Ls "https://get.maestro.mobile.dev" | bash

    # Windows (via WSL or PowerShell)
    # See https://maestro.mobile.dev/getting-started/installing-maestro
    ```

2. Build the app for a simulator:

    ```bash
    # iOS
    npx expo run:ios

    # Android
    npx expo run:android
    ```

3. Run a single flow:

    ```bash
    maestro test e2e/new-game-setup.yaml
    ```

4. Run all flows:
    ```bash
    maestro test e2e/
    ```

## Flows

| File                       | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `new-game-setup.yaml`      | Create a 2/3/4 player game and verify scoreboard  |
| `score-entry-stop.yaml`    | Enter a round with Stop end type                  |
| `full-game-to-winner.yaml` | Play a complete game until a winner is declared   |
| `mermaid-instant-win.yaml` | Trigger a mermaid instant win with 4 mermaids     |
| `tie-breaker.yaml`         | Force a tie and resolve via tie-breaker           |
| `last-chance-flow.yaml`    | Enter a Last Chance round with caller selection   |
| `new-game-reset.yaml`      | Verify New Game clears state and returns to setup |

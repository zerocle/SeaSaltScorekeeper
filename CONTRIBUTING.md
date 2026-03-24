# Contributing to Sea Salt Scorekeeper

Thanks for your interest in contributing! This guide walks you through the process.

## Fork-and-Branch Workflow

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
    ```bash
    git clone https://github.com/<your-username>/sea-salt-paper-scorer.git
    cd sea-salt-paper-scorer
    ```
3. **Create a branch** for your change:
    ```bash
    git checkout -b my-feature
    ```
4. Make your changes, commit them, and **push** the branch to your fork:
    ```bash
    git push origin my-feature
    ```
5. Open a **Pull Request** against the `main` branch of the upstream repository.

## Local Development Setup

1. Make sure you have **Node.js ≥ 20** and **npm** installed.
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npx expo start
    ```

## Running Tests

All tests must pass before you submit a pull request. Run the full suite locally:

```bash
# Unit and property-based tests
npm test

# Component tests
npm run test:components
```

If you are adding new functionality, include appropriate tests covering your changes.

## Pull Request Format

When opening a PR, please follow this format:

- **Descriptive title** — summarize the change in a short, clear sentence.
- **Summary of changes** — in the PR body, explain what was changed and why. Include any relevant context or links to issues.

## CI Pipeline

Every pull request triggers the [CI workflow](.github/workflows/ci.yml), which runs type-checking, unit tests, and component tests. All CI checks must pass before a PR can be merged. If a check fails, review the Actions log, fix the issue, and push an update to your branch.

# Implementation Plan: GitHub CI & Documentation

## Overview

Create the GitHub Actions CI workflow, project README, and contributing guide. All tasks produce static files (YAML and Markdown) plus TypeScript tests to validate their content. Each task builds incrementally — CI workflow first, then documentation, then wiring validation.

## Tasks

- [x]   1. Create the GitHub Actions CI workflow
    - [x] 1.1 Create `.github/workflows/ci.yml` with the full CI pipeline
        - Define workflow name (e.g., "CI")
        - Configure triggers: `pull_request` targeting `main` (opened + synchronized) and `push` to `main`
        - Define single job on `ubuntu-latest` runner
        - Add steps: checkout (`actions/checkout@v4`), setup Node 20 with npm cache (`actions/setup-node@v4`), `npm ci`, `npx tsc --noEmit`, `npm test`, `npm run test:components`
        - Each step must have a descriptive `name` field
        - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3_

    - [ ]\* 1.2 Write property test: CI workflow contains all required check steps
        - **Property 1: CI workflow contains all required check steps**
        - Parse `ci.yml` and verify it contains named steps for `npm ci`, `tsc --noEmit`, `npm test`, and `npm run test:components`
        - Use `fast-check` with `{ numRuns: 100 }`
        - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 6.3**

    - [ ]\* 1.3 Write property test: CI workflow triggers on both PR and push to main
        - **Property 2: CI workflow triggers on both PR and push to main**
        - Parse `ci.yml` and verify triggers include `pull_request` (branches: main) and `push` (branches: main)
        - Use `fast-check` with `{ numRuns: 100 }`
        - **Validates: Requirements 1.1, 1.4, 2.1**

    - [ ]\* 1.4 Write unit tests for CI workflow structure
        - Parse `ci.yml` and verify: runner is `ubuntu-latest`, Node version is 20, npm cache is enabled, workflow has a descriptive name
        - _Requirements: 3.1, 3.2, 3.3, 6.2_

- [x]   2. Checkpoint - Verify CI workflow
    - Ensure all tests pass, ask the user if questions arise.

- [x]   3. Create project README
    - [x] 3.1 Create `README.md` at the repository root
        - Include project name and description (Sea Salt & Paper Scorer)
        - List tech stack: Expo SDK 54, React Native 0.81.5, React 19.1, TypeScript 5.8, Zustand
        - List prerequisites: Node.js ≥ 20, npm, Expo CLI
        - Add getting started steps: clone, `npm install`, `npx expo start`
        - Add available scripts table: `start`, `test`, `test:components`, `test:e2e`
        - Describe project directory structure: `app/`, `src/`, `e2e/`, `assets/`
        - Add testing section covering unit, component, and e2e tests
        - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

    - [ ]\* 3.2 Write property test: README documents all required technologies and scripts
        - **Property 3: README documents all required technologies and scripts**
        - Generate random subsets of {Expo, React Native, TypeScript, Zustand} and {start, test, test:components, test:e2e}, verify each item appears in README content
        - Use `fast-check` with `{ numRuns: 100 }`
        - **Validates: Requirements 4.2, 4.5**

    - [ ]\* 3.3 Write unit tests for README content
        - Verify README contains: project name, prerequisites section, setup instructions, directory structure, test commands
        - _Requirements: 4.1, 4.3, 4.4, 4.6, 4.7_

- [x]   4. Create contributing guide
    - [x] 4.1 Create `CONTRIBUTING.md` at the repository root
        - Describe fork-and-branch workflow
        - List local development setup steps
        - Specify that all tests must pass before submitting a PR
        - Describe expected PR format (descriptive title, summary of changes)
        - Reference the CI pipeline as a required check
        - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

    - [ ]\* 4.2 Write unit tests for CONTRIBUTING.md content
        - Verify contributing guide mentions: fork-and-branch, local setup, test requirements, PR format, CI reference
        - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x]   5. Final checkpoint - Ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All artifacts are static files — no application code changes required
- Property tests use `fast-check` (already in devDependencies)
- CI workflow tests parse the YAML file to validate structure and content
- Documentation tests read the Markdown files and check for required sections/keywords

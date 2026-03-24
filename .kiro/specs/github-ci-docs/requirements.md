# Requirements Document

## Introduction

This feature prepares the Sea Salt & Paper Scorer project for GitHub by adding CI/CD workflows via GitHub Actions and comprehensive project documentation. The CI pipeline ensures safe delivery of changes by running linting, type-checking, unit tests, and component tests on every pull request and push. The documentation provides contributors and users with clear guidance on the project, setup, testing, and contribution process.

## Glossary

- **CI_Pipeline**: The GitHub Actions continuous integration workflow that validates code changes by running automated checks
- **Unit_Test_Suite**: The Jest test suite executed via `npm test` covering game logic, scoring engine, deck limits, persistence, and utility tests
- **Component_Test_Suite**: The Jest test suite executed via `npm run test:components` covering React Native UI component tests
- **README**: The root-level `README.md` file providing project overview, setup instructions, and usage documentation
- **Contributing_Guide**: The `CONTRIBUTING.md` file describing how external contributors can participate in the project
- **PR**: A GitHub Pull Request submitted to merge changes into the main branch
- **Type_Check**: The TypeScript compiler check (`npx tsc --noEmit`) that validates type correctness without emitting output
- **Workflow_File**: A YAML file in `.github/workflows/` that defines a GitHub Actions workflow

## Requirements

### Requirement 1: CI Pipeline on Pull Requests

**User Story:** As a developer, I want automated checks to run on every pull request, so that I can catch regressions before merging.

#### Acceptance Criteria

1. WHEN a PR is opened against the main branch, THE CI_Pipeline SHALL run the Type_Check step
2. WHEN a PR is opened against the main branch, THE CI_Pipeline SHALL run the Unit_Test_Suite
3. WHEN a PR is opened against the main branch, THE CI_Pipeline SHALL run the Component_Test_Suite
4. WHEN a PR is synchronized (new commits pushed), THE CI_Pipeline SHALL re-run all checks
5. IF any check in the CI_Pipeline fails, THEN THE CI_Pipeline SHALL report the failure status on the PR

### Requirement 2: CI Pipeline on Push to Main

**User Story:** As a maintainer, I want the CI pipeline to run on pushes to main, so that the main branch stays validated at all times.

#### Acceptance Criteria

1. WHEN code is pushed to the main branch, THE CI_Pipeline SHALL run the Type_Check step
2. WHEN code is pushed to the main branch, THE CI_Pipeline SHALL run the Unit_Test_Suite
3. WHEN code is pushed to the main branch, THE CI_Pipeline SHALL run the Component_Test_Suite

### Requirement 3: CI Pipeline Execution Environment

**User Story:** As a developer, I want the CI pipeline to use a consistent environment, so that test results are reproducible.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL execute on an Ubuntu runner
2. THE CI_Pipeline SHALL use Node.js version 20
3. THE CI_Pipeline SHALL cache npm dependencies to reduce workflow execution time
4. THE CI_Pipeline SHALL install dependencies using `npm ci` for deterministic builds

### Requirement 4: Project README

**User Story:** As a visitor or potential contributor, I want a comprehensive README, so that I can understand the project and get started quickly.

#### Acceptance Criteria

1. THE README SHALL include the project name and a brief description of the application
2. THE README SHALL list the key technologies used (Expo SDK 54, React Native, TypeScript, Zustand)
3. THE README SHALL include prerequisites for local development (Node.js, npm, Expo CLI)
4. THE README SHALL include step-by-step instructions for installing dependencies and starting the development server
5. THE README SHALL document available npm scripts (`start`, `test`, `test:components`, `test:e2e`)
6. THE README SHALL describe the project directory structure at a high level
7. THE README SHALL include a section on how to run each type of test (unit, component, e2e)

### Requirement 5: Contributing Guide

**User Story:** As a potential contributor, I want clear contribution guidelines, so that I know the process for submitting changes.

#### Acceptance Criteria

1. THE Contributing_Guide SHALL describe the fork-and-branch workflow for submitting contributions
2. THE Contributing_Guide SHALL list the steps to set up a local development environment
3. THE Contributing_Guide SHALL specify that all tests must pass before submitting a PR
4. THE Contributing_Guide SHALL describe the expected PR format (descriptive title, summary of changes)
5. THE Contributing_Guide SHALL reference the CI_Pipeline as a required check for PRs

### Requirement 6: Workflow File Structure

**User Story:** As a maintainer, I want the workflow files to follow GitHub Actions conventions, so that they are easy to maintain.

#### Acceptance Criteria

1. THE Workflow_File SHALL be located at `.github/workflows/ci.yml`
2. THE Workflow_File SHALL use a descriptive workflow name
3. THE Workflow_File SHALL define separate named steps for dependency installation, type checking, unit tests, and component tests

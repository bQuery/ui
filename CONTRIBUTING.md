# Contributing to @bquery/ui

Thanks for your interest in contributing to **@bquery/ui**! This guide explains how to set up the project locally, develop components, and run tests.

## Prerequisites

- **Node.js** `>=24.0.0`
- **Bun** `>=1.3.13` (recommended)
- **Git**

## Setup

1. Clone the repository.
2. Install dependencies: `bun install`

## Development

- Start the Vite dev server: `bun run dev`
- Start Storybook: `bun run storybook`
- Start the docs site: `bun run dev:docs`

## Tests

- Run all tests: `bun test`
- Type-check: `bun run lint:types`

## Build

- Build the library: `bun run build`
- Build Storybook: `bun run build:storybook`
- Build docs: `bun run build:docs`

## Code Style & Quality

- Keep changes small and focused.
- Follow the existing TypeScript style and component structure.
- Run `bun run lint` before submitting.
- Add tests when introducing new component behaviour or fixing bugs.
- Update docs/Storybook stories when the public API changes.

## Pull Requests

- Describe **what** and **why** you changed something.
- Link relevant issues if available.
- Use the pull request template and complete the validation checklist.
- Ensure tests and type-checks pass locally and the docs still build.

## Security

Please do not post sensitive details publicly. Report security issues responsibly per `SECURITY.md`.

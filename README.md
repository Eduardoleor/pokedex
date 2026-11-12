# Pokédex

React Native (Expo) app that consumes [PokéAPI](https://pokeapi.co/) to list Pokémon and show the details of each one.

## Requirements

| Tool     | Version                        |
| -------- | ------------------------------ |
| Node.js  | 22.13+ or 24.3+ (see `.nvmrc`) |
| pnpm     | 10+                            |
| Expo SDK | 58                             |

Running on a device requires Xcode (iOS), Android Studio (Android) or Expo Go.

## Getting started

```bash
nvm use
pnpm install
```

`pnpm install` also registers the git hooks (Husky). Installing with npm or yarn is blocked.

```bash
pnpm start     # dev server
pnpm ios       # iOS simulator
pnpm android   # Android emulator
```

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm lint`         | Run ESLint on the whole project              |
| `pnpm lint:fix`     | Run ESLint with autofix                      |
| `pnpm format`       | Format with Prettier                         |
| `pnpm format:check` | Check formatting without writing             |
| `pnpm typecheck`    | Type-check with `tsc`                        |
| `pnpm validate`     | `typecheck` + `lint` + `format:check`        |
| `pnpm doctor`       | Diagnose dependency and config issues (Expo) |

## Code quality

- **TypeScript** in strict mode, plus `noUncheckedIndexedAccess` and `noImplicitReturns`.
- **ESLint** (`eslint-config-expo` + project rules): sorted imports, no `any`, no floating promises, hook dependencies and import cycles.
- **Prettier** runs through ESLint, so there is a single source of formatting.
- **Husky + lint-staged + commitlint** check formatting, lint, commit messages and branch names before code leaves the machine.

Rules and workflow are described in [CONTRIBUTING.md](CONTRIBUTING.md).

## CI/CD

| Workflow                                                 | Trigger                  | Purpose                                                      |
| -------------------------------------------------------- | ------------------------ | ------------------------------------------------------------ |
| [CI](.github/workflows/ci.yml)                           | PR to `develop` / `main` | Quality checks and Android build                             |
| [Release PR](.github/workflows/release-pr.yml)           | Push to `develop`        | Opens or updates the `develop → main` PR                     |
| [Android Release](.github/workflows/android-release.yml) | Push to `main`           | Builds the APK, tags `vX.Y.Z` and publishes a GitHub Release |
| [Dependabot](.github/dependabot.yml)                     | Weekly (Monday)          | Grouped dependency update PR to `develop`                    |

iOS builds are **WIP**. Details, cost decisions and required settings are in [docs/ci-cd.md](docs/ci-cd.md).

## Architecture

Clean Architecture with ports & adapters: `domain` (models, enums, ports) ← `application` (use cases) ← `presentation` (hooks, atomic components), with `infrastructure` (fetch client, PokéAPI adapter) implementing the domain ports and `di` wiring everything together. Layer boundaries are enforced by ESLint.

Full description, folder map and data flow: [docs/architecture.md](docs/architecture.md).

## Features

- First 20 Pokémon on launch, more loaded while scrolling (infinite pagination) and pull to refresh.
- Detail screen with artwork, types, height, weight, base experience, abilities and base stats.
- Light and dark mode, following the system or chosen from the header toggle.
- Offline support: saved data opens instantly, a 5-day cache keeps it fresh in the background, and details are saved ahead of time.
- Loading skeletons, empty and error states with retry, screen reader labels.

## Technical decisions

| Decision                                    | Why                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clean Architecture (ports & adapters)       | Business rules are independent from React, `fetch` and storage; adapters can be swapped or faked in tests                                                     |
| Native `fetch` wrapped in `FetchHttpClient` | No HTTP library needed; timeout, cancellation, retries and error normalization in one place                                                                   |
| React Context + `useReducer` for state      | Enough for two screens; no state library                                                                                                                      |
| File-based cache with a 5-day TTL           | React Native ships no storage API and AsyncStorage is a community library. `expo-file-system` is part of the Expo SDK; JSON files fit small, read-mostly data |
| Stale-while-revalidate                      | Instant screens, background refresh, no data lost when the network fails                                                                                      |
| Connectivity inferred from requests         | Avoids a network-status library; a failed request is the signal that matters                                                                                  |
| Hand-made atomic components                 | Required by the challenge; one theme source keeps light/dark consistent                                                                                       |

Details: [docs/architecture.md](docs/architecture.md).

## Libraries

The app uses React Native and the Expo SDK only. Packages that matter for the solution:

| Package            | Use                                                       |
| ------------------ | --------------------------------------------------------- |
| `expo-router`      | File-based navigation (list → detail)                     |
| `expo-file-system` | Persistent offline cache                                  |
| `expo-image`       | Remote images with disk cache (artwork available offline) |
| `expo-status-bar`  | Status bar style per theme                                |

Dev tooling (ESLint, Prettier, Husky, commitlint, `@expo/fingerprint`) is listed in [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ci-cd.md](docs/ci-cd.md).

## Pending work and future improvements

- iOS build in CI (WIP).
- The APK `versionName` comes from `app.json`; it is not synced with the release tag yet.
- Automated tests (unit tests for reducers, `cachedQuery` and mappers are the natural first step).
- Cache size limit / cleanup of entries for Pokémon that are no longer listed.

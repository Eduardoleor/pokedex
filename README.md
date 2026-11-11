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

_Pending._

## Technical decisions

_Pending._

## Pending work and future improvements

- iOS build in CI (WIP).
- The APK `versionName` comes from `app.json`; it is not synced with the release tag yet.

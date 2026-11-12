# Contributing

## Package manager

The project uses **pnpm** only (enforced by `only-allow` in `preinstall`). Expo and React Native packages are added with:

```bash
pnpm expo install <package>
```

This resolves the version that matches the SDK. Dev tooling not tied to the SDK is installed with `pnpm add -D`.

## Consistent formatting

`pnpm install` is the only setup step. Everything below is versioned in the repo, so every clone formats code the same way and no commit carries unrelated formatting changes:

| File                       | What it guarantees                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `package.json` (`prepare`) | Installs the Husky hooks on `pnpm install`                                                      |
| `.npmrc` (`save-exact`)    | New dependencies are pinned to an exact version                                                 |
| `package.json`             | Prettier, ESLint and their plugins are pinned to exact versions                                 |
| `.gitattributes`           | LF line endings on every OS (no CRLF diffs from Windows)                                        |
| `.editorconfig`            | Indentation, charset, final newline and trailing whitespace for any editor                      |
| `.vscode/settings.json`    | Format on save with the project's Prettier, ESLint fixes on save, no competing import organizer |
| `.vscode/extensions.json`  | Recommends the ESLint, Prettier and EditorConfig extensions                                     |

As a final guard, lint-staged formats staged files on commit and CI fails on any unformatted file.

## Git Flow

| Branch      | From      | Into                 | Purpose                          |
| ----------- | --------- | -------------------- | -------------------------------- |
| `main`      | —         | —                    | Released code. No direct commits |
| `develop`   | `main`    | —                    | Integration branch               |
| `feature/*` | `develop` | `develop`            | New functionality                |
| `bugfix/*`  | `develop` | `develop`            | Fix before release               |
| `release/*` | `develop` | `main` and `develop` | Release preparation              |
| `hotfix/*`  | `main`    | `main` and `develop` | Urgent production fix            |

Branch names are lowercase and kebab-case: `feature/pokemon-list`, `hotfix/detail-crash`.

Every merge into `develop` refreshes an automatic release PR (`develop → main`) with the changelog. Merging it triggers the Android build. See [docs/ci-cd.md](docs/ci-cd.md).

## Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Allowed types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`.

```
feat(list): add pokemon list screen
fix(api): handle network timeout
chore: configure eslint and prettier
```

The header is limited to 100 characters. The commit type also decides the section where the change shows up in the release PR.

## Git hooks

| Hook         | What it does                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------- |
| `pre-commit` | Blocks commits on `main`, runs ESLint + Prettier on staged files and type-checks the project |
| `commit-msg` | Validates the message with commitlint                                                        |
| `pre-push`   | Checks the branch name against Git Flow and runs `pnpm validate`                             |

If a hook fails, fix the problem. Do not use `--no-verify`; CI runs the same checks.

## Code style

- Prettier owns formatting (`.prettierrc`); it is not discussed in code review.
- Imports are grouped and sorted automatically: React / React Native, external packages, `@/` alias, relative.
- Use the `@/` alias for anything inside `src/`.
- Use `import type` for type-only imports.
- No `any`, explicit or implicit: every variable is initialized or typed where it is declared, and `any` values cannot be assigned, called or returned (`no-unsafe-*`).
- No non-null assertions (`!`) and no unhandled promises.
- A lint or type error blocks the commit; nothing is pushed with known errors.
- `console.log` does not reach `develop`; `console.warn` and `console.error` are allowed.

## Before opening a PR

```bash
pnpm validate
```

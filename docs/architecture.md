# Architecture

Clean Architecture organized as **ports & adapters** (hexagonal). Business rules sit in the center and know nothing about React, `fetch` or PokéAPI; everything else plugs into them through interfaces.

```
              ┌──────────────────────────────────────────┐
  app/  ───▶  │ presentation  (hooks, components)        │
              │        │ uses                            │
              │        ▼                                 │
              │ application   (use cases)                │
              │        │ depends on                      │
              │        ▼                                 │
              │ domain        (models, enums, ports)     │ ◀── infrastructure (adapters)
              └──────────────────────────────────────────┘        implements ports
                         ▲
                 di/ wires adapters into use cases
```

Dependencies only point inward. The rule is enforced by ESLint (`import/no-restricted-paths` in `eslint.config.js`), so a wrong import fails `pnpm lint` and CI.

## Layers

| Layer            | Folder               | Contains                                                          | May import              |
| ---------------- | -------------------- | ----------------------------------------------------------------- | ----------------------- |
| Domain           | `src/domain`         | Models, enums, types, ports (interfaces), `AppError`              | nothing                 |
| Application      | `src/application`    | Use cases: input validation and orchestration of ports            | domain                  |
| Infrastructure   | `src/infrastructure` | Adapters: HTTP client, PokéAPI repository, DTOs, mappers          | domain                  |
| Presentation     | `src/presentation`   | Hooks, components (atomic design), UI error messages              | domain, application, di |
| Composition root | `src/di`             | Builds adapters and use cases, exposes them through React context | everything              |
| Routes           | `src/app`            | Expo Router screens; thin, they connect hooks to components       | presentation, di        |

### Where to find things

```
src/
  domain/
    models/        PokemonSummary, PokemonDetail, PokemonStat, PokemonAbility
    enums/         PokemonType, StatName (+ type guards)
    types/         Page, PageRequest
    ports/         PokemonRepository
    errors/        AppError, ErrorKind, toAppError
  application/
    use-cases/     GetPokemonPage, GetPokemonDetail
  infrastructure/
    http/          FetchHttpClient and its types
    pokeapi/       PokeApiPokemonRepository, dtos/, mappers/, config
  presentation/
    hooks/         useAsyncTask, usePokemonList, usePokemonDetail
    errors/        getErrorMessage (ErrorKind → user-facing copy)
    types/         RequestStatus
    components/    atoms/ molecules/ organisms/ (atomic design)
  di/              createDependencies, DependenciesProvider, useDependencies
  app/             _layout.tsx, routes
```

Naming: files in kebab-case; DTOs end in `.dto.ts`, mappers in `.mapper.ts`. Each folder exposes its public API through an `index.ts`.

## Data flow

```
usePokemonList ─▶ GetPokemonPage.execute ─▶ PokemonRepository (port)
                                               ▲
                     PokeApiPokemonRepository ─┘ ─▶ FetchHttpClient ─▶ fetch
                     DTO ─▶ mapper ─▶ domain model
```

1. A hook gets the use case from `useDependencies()` and calls it with an `AbortSignal`.
2. The use case validates the input and calls the port.
3. The adapter requests PokéAPI through the HTTP client, receives a DTO (the API shape, snake_case) and maps it to a domain model (camelCase, meters/kilograms, typed enums).
4. Any failure becomes an `AppError` with an `ErrorKind`. The hook stores it and the UI turns it into a message with `getErrorMessage`.

## HTTP client

`FetchHttpClient` (`src/infrastructure/http`) wraps the native `fetch`; no external libraries.

| Feature      | Behavior                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Config       | `baseUrl`, default `headers`, `timeoutMs` (15 s), `retries` (2), `retryDelayMs` (300 ms)                                                |
| Per request  | `params`, `headers`, `timeoutMs`, `retries`, `responseType`, `signal` override the defaults                                             |
| Query params | Encoded manually (arrays repeat the key, `null`/`undefined` are skipped)                                                                |
| Responses    | JSON or text inferred from `Content-Type`; empty bodies (204/205/304) return `undefined`; status and headers are returned with the data |
| Timeout      | Own `AbortController`; reported as `ErrorKind.Timeout`                                                                                  |
| Cancellation | External `AbortSignal` is forwarded; reported as `ErrorKind.Cancelled` and never retried                                                |
| Retries      | Idempotent methods only, on network, timeout, 5xx and 429, with exponential backoff                                                     |
| Errors       | Always `AppError`: `Network`, `Timeout`, `Cancelled`, `NotFound`, `Client`, `Server`, `InvalidResponse`                                 |

Adding an endpoint means adding a DTO, a mapper and a method in the adapter; the client does not change.

## Hooks

| Hook                       | Returns                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `useAsyncTask(task)`       | `status`, `data`, `error`, `isLoading`, `reload`. Aborts the previous run when `task` changes or on unmount                  |
| `usePokemonList(pageSize)` | `items`, `total`, `status`, `error`, `isLoading`, `isRefreshing`, `isLoadingMore`, `hasMore`, `loadMore`, `refresh`, `retry` |
| `usePokemonDetail(id)`     | `pokemon`, `status`, `error`, `isLoading`, `reload`                                                                          |

State lives in `useReducer`, so every transition is explicit and testable without rendering.

## Components (atomic design)

| Level       | Examples                                  |
| ----------- | ----------------------------------------- |
| `atoms`     | Text, image, badge, spinner               |
| `molecules` | Type badges row, stat bar                 |
| `organisms` | Pokémon list, Pokémon card, detail header |

`templates` and `pages` are intentionally left out: with two screens there is no repeated layout, and Expo Router routes already play the role of pages.

## Dependency injection

`createDependencies()` in `src/di/container.ts` is the only place that instantiates adapters. `DependenciesProvider` accepts a `value` prop, so tests or previews can inject fakes for any use case without touching the network.

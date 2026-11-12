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
    enums/         PokemonType, StatName, DataSource (+ type guards)
    types/         Page, PageRequest, Cached
    ports/         PokemonRepository, CacheStore
    errors/        AppError, ErrorKind, toAppError
  application/
    cache/         CachePolicy (5-day TTL), cachedQuery (stale-while-revalidate)
    use-cases/     GetPokemonPage, GetPokemonDetail
  infrastructure/
    http/          FetchHttpClient and its types
    pokeapi/       PokeApiPokemonRepository, dtos/, mappers/, config
    storage/       FileSystemCacheStore, MemoryCacheStore
  presentation/
    providers/     PokemonDataProvider (list + details contexts, background sync)
    theme/         ThemeProvider, palettes (light/dark), tokens
    navigation/    NavigationTheme (headers and status bar follow the theme)
    hooks/         usePokemonList, usePokemonDetail
    components/    atoms/ molecules/ organisms/ (atomic design)
    errors/        getErrorMessage (ErrorKind → user-facing copy)
    types/         RequestStatus, ThemePreference
    utils/         formatters (names, dex number, units, relative time)
  di/              createDependencies, DependenciesProvider, useDependencies
  app/             _layout.tsx, routes
```

Naming: files in kebab-case; DTOs end in `.dto.ts`, mappers in `.mapper.ts`. Each folder exposes its public API through an `index.ts`.

## Data flow

```
screen ─▶ usePokemonList ─▶ PokemonDataProvider (context)
                                   │
                                   ▼
                  GetPokemonPage.execute ─▶ cachedQuery ─┬─▶ CacheStore (port) ◀─ FileSystemCacheStore
                                                         └─▶ PokemonRepository (port) ◀─ PokeApiPokemonRepository
                                                                                          └─▶ FetchHttpClient ─▶ fetch
```

1. Screens read state from the data contexts through hooks; they never call use cases directly.
2. The provider gets use cases from `useDependencies()` and calls them with an `AbortSignal`.
3. The use case validates the input and resolves the data through `cachedQuery`: saved copy first, network when needed.
4. The adapter requests PokéAPI, receives a DTO (the API shape, snake_case) and maps it to a domain model (camelCase, meters/kilograms, typed enums).
5. Any failure becomes an `AppError` with an `ErrorKind`. The provider stores it and the UI turns it into a message with `getErrorMessage`.

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

## State: contexts and hooks

Two React contexts, no state library:

| Context                 | Holds                                                   | Consumed through       |
| ----------------------- | ------------------------------------------------------- | ---------------------- |
| `ThemeContext`          | Active theme (light/dark), user preference              | `useTheme()`           |
| `PokemonListContext`    | Loaded pages, pagination, loading/refresh/offline flags | `usePokemonList()`     |
| `PokemonDetailsContext` | Detail entries by id                                    | `usePokemonDetail(id)` |

List and details live in separate contexts so loading a detail does not re-render the list. Each one is driven by a `useReducer` (`list-reducer.ts`, `details-reducer.ts`), so every transition is explicit and testable without rendering. The list survives navigation because it lives above the stack.

| Hook                   | Returns                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `usePokemonList()`     | `items`, `total`, `status`, `error`, `isLoading`, `isRefreshing`, `isLoadingMore`, `isOffline`, `updatedAt`, `hasMore`, `loadMore`, `refresh`, `retry` |
| `usePokemonDetail(id)` | `pokemon`, `status`, `error`, `isLoading`, `isOffline`, `updatedAt`, `reload`                                                                          |

## Offline and caching

Goal: the app opens instantly with saved data, works without a connection for everything already seen, and keeps itself up to date without spinners or prompts.

| Piece               | Behavior                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Storage             | `FileSystemCacheStore`: one JSON file per key in the documents directory (not purged by the OS). Versioned folder (`pokeapi-v1`) |
| Freshness           | `CachePolicy` with a **5-day TTL**. Fresh data is served without touching the network                                            |
| Stale data          | Served immediately and flagged `isStale`; the provider refreshes it silently in the background                                   |
| Network failure     | If anything is saved (of any age) it is shown with a quiet "Offline — showing saved data · saved 2 days ago" banner              |
| Nothing saved       | Full-screen message with a retry button                                                                                          |
| Background prefetch | Details of every loaded Pokémon are saved quietly (2 at a time, fresh entries skipped, stops at the first connectivity error)    |
| Reconnection        | While offline with data on screen, a silent retry every 30 s; also when the app returns to the foreground                        |
| Images              | `expo-image` with `cachePolicy="memory-disk"`: artwork seen once is available offline                                            |
| Pull to refresh     | Forces the network for the first page; on failure the saved list stays                                                           |

Connectivity is inferred from request results (`ErrorKind.Network` / `Timeout`), so no network-status library is needed. Data is never discarded because the network failed; it is only replaced by a successful response.

## Theme

`ThemeProvider` resolves the active scheme from the user preference (`system`, `light`, `dark`; saved in the `preferences` store) and the OS setting. Components only read tokens from `useTheme()`:

- `palettes.light` / `palettes.dark`: semantic colors (`background`, `surface`, `textPrimary`, `primary`…).
- `typeColors`: badge background and text color per Pokémon type, chosen for AA contrast.
- `spacing`, `radius`, `typography`, `MIN_TOUCH_SIZE` (44 pt).

`NavigationTheme` maps the palette to Expo Router headers and switches the status bar style.

## Components (atomic design)

All components are built from React Native primitives (`View`, `Text`, `Pressable`, `FlatList`, `Animated`), themed through `useTheme()` and labeled for screen readers.

| Level       | Components                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `atoms`     | `Text`, `Button`, `IconButton`, `Spinner`, `Surface`, `Badge`, `Skeleton`, `RemoteImage`          |
| `molecules` | `TypeBadge`, `StatBar`, `InfoItem`, `StatusMessage`, `ConnectionBanner`, `ThemeToggle`            |
| `organisms` | `PokemonCard`, `PokemonGrid`, `PokemonGridSkeleton`, `PokemonDetailView`, `PokemonDetailSkeleton` |

`templates` and `pages` are intentionally left out: with two screens there is no repeated layout, and Expo Router routes already play the role of pages.

Details worth knowing: the grid is a virtualized `FlatList` with 2/3/5 columns depending on width; cards are memoized; skeletons respect the "reduce motion" accessibility setting; text scales with the system font size up to 1.6×.

## Dependency injection

`createDependencies()` in `src/di/container.ts` is the only place that instantiates adapters. `DependenciesProvider` accepts a `value` prop, so tests or previews can inject fakes for any use case without touching the network.

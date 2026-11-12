import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDependencies } from '@/di';
import type { PokemonSummary } from '@/domain/models';

const CAUGHT_KEY = 'caught-pokemon';

export interface CaughtPokemon extends PokemonSummary {
  /** Epoch milliseconds. */
  caughtAt: number;
}

interface CaughtContextValue {
  /** Caught Pokémon, most recent first. */
  items: CaughtPokemon[];
  ids: ReadonlySet<number>;
  /** Saves a Pokémon caught with a thrown Poké Ball and flags the home celebration. */
  catchPokemon: (pokemon: PokemonSummary) => void;
  release: (id: number) => void;
  releaseAll: () => void;
  /** True right after a catch, until the home Poké Ball has celebrated it. */
  hasNewCatch: boolean;
  acknowledgeCatch: () => void;
}

const CaughtContext = createContext<CaughtContextValue | null>(null);

/**
 * Reads one saved catch. Catches stored before dates were recorded get `fallbackDate`
 * (when the list was last saved): they were caught on that day or earlier.
 */
function toCaught(value: unknown, fallbackDate: number): CaughtPokemon | null {
  const item = value as Partial<CaughtPokemon> | null;
  if (
    typeof item?.id !== 'number' ||
    typeof item.name !== 'string' ||
    typeof item.imageUrl !== 'string'
  ) {
    return null;
  }
  const caughtAt = typeof item.caughtAt === 'number' ? item.caughtAt : fallbackDate;
  return { id: item.id, name: item.name, imageUrl: item.imageUrl, caughtAt };
}

export function CaughtProvider({ children }: { children: ReactNode }) {
  const { preferences } = useDependencies();
  const [items, setItems] = useState<CaughtPokemon[]>([]);
  const [hasNewCatch, setHasNewCatch] = useState(false);

  useEffect(() => {
    let active = true;
    preferences
      .get<unknown[]>(CAUGHT_KEY)
      .then((saved) => {
        if (!active || !Array.isArray(saved?.value)) {
          return;
        }
        const stored = saved.value
          .map((item) => toCaught(item, saved.savedAt))
          .filter((item): item is CaughtPokemon => item !== null);
        const needsMigration = saved.value.some(
          (item) => typeof (item as Partial<CaughtPokemon> | null)?.caughtAt !== 'number',
        );
        // Keeps anything caught while the file was still loading.
        setItems((current) => {
          const merged = [
            ...current,
            ...stored.filter((item) => !current.some((c) => c.id === item.id)),
          ];
          // Writes the backfilled dates once so they stay stable from now on.
          if (needsMigration) {
            preferences.set(CAUGHT_KEY, merged).catch(() => undefined);
          }
          return merged;
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [preferences]);

  const update = useCallback(
    (change: (current: CaughtPokemon[]) => CaughtPokemon[]) => {
      setItems((current) => {
        const next = change(current);
        preferences.set(CAUGHT_KEY, next).catch(() => undefined);
        return next;
      });
    },
    [preferences],
  );

  const catchPokemon = useCallback(
    (pokemon: PokemonSummary) => {
      // Only what the lists need, so a full detail is never written to disk.
      const { id, name, imageUrl } = pokemon;
      update((current) => [
        { id, name, imageUrl, caughtAt: Date.now() },
        ...current.filter((item) => item.id !== pokemon.id),
      ]);
      setHasNewCatch(true);
    },
    [update],
  );
  const release = useCallback(
    (id: number) => update((current) => current.filter((item) => item.id !== id)),
    [update],
  );
  const releaseAll = useCallback(() => update(() => []), [update]);
  const acknowledgeCatch = useCallback(() => setHasNewCatch(false), []);
  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const value = useMemo(
    () => ({ items, ids, catchPokemon, release, releaseAll, hasNewCatch, acknowledgeCatch }),
    [items, ids, catchPokemon, release, releaseAll, hasNewCatch, acknowledgeCatch],
  );

  return <CaughtContext value={value}>{children}</CaughtContext>;
}

export function useCaught(): CaughtContextValue {
  const context = useContext(CaughtContext);
  if (!context) {
    throw new Error('useCaught must be used inside <CaughtProvider>');
  }
  return context;
}

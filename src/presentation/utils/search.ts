import type { PokemonSummary } from '@/domain/models';

/** Lowercase, accent-free, with dashes, dots and apostrophes treated as spaces. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[♀]/g, ' f ')
    .replace(/[♂]/g, ' m ')
    .replace(/[-_.'’:]/g, ' ')
    .replace(/[^a-z0-9#\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches by name or Pokedex number. Every word of the query must appear in the name
 * ("mime mr" finds Mr. Mime), and "#25", "025" or "25" find Pikachu by number.
 */
export function matchesPokemon(pokemon: PokemonSummary, rawQuery: string): boolean {
  const query = normalizeSearch(rawQuery);
  if (!query) {
    return true;
  }
  const number = /^#?0*(\d+)$/.exec(query.replace(/\s/g, ''));
  if (number) {
    return String(pokemon.id).startsWith(number[1] ?? '');
  }
  const name = normalizeSearch(pokemon.name);
  const compact = name.replace(/\s/g, '');
  return query
    .replace(/#/g, '')
    .split(' ')
    .filter(Boolean)
    .every((word) => name.includes(word) || compact.includes(word));
}

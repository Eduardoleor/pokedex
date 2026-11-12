/** National Pokedex ranges per generation. */
export const GENERATIONS = [
  { label: 'Gen I', first: 1, last: 151 },
  { label: 'Gen II', first: 152, last: 251 },
  { label: 'Gen III', first: 252, last: 386 },
  { label: 'Gen IV', first: 387, last: 493 },
  { label: 'Gen V', first: 494, last: 649 },
  { label: 'Gen VI', first: 650, last: 721 },
  { label: 'Gen VII', first: 722, last: 809 },
  { label: 'Gen VIII', first: 810, last: 905 },
  { label: 'Gen IX', first: 906, last: 1025 },
] as const;

export type Generation = (typeof GENERATIONS)[number];

export function isInGeneration(id: number, generation: Generation): boolean {
  return id >= generation.first && id <= generation.last;
}

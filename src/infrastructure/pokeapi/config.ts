export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export function artworkUrl(id: number): string {
  return `${ARTWORK_BASE_URL}/${id}.png`;
}

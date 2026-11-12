import { AppError, ErrorKind } from '@/domain/errors';
import type { PokemonDetail } from '@/domain/models';
import type { MediaCache, SoundPlayer } from '@/domain/ports';

type CrySource = Pick<PokemonDetail, 'id' | 'cryUrl'>;

interface PlayOptions {
  /** Called once the file is ready and playback starts (after a download, if any). */
  onStart?: () => void;
}

/** Plays a Pokémon cry, downloading it the first time so later plays work offline. */
export class PlayPokemonCry {
  constructor(
    private readonly media: MediaCache,
    private readonly player: SoundPlayer,
  ) {}

  async isSaved(pokemon: CrySource): Promise<boolean> {
    return (await this.media.find(this.keyFor(pokemon))) !== null;
  }

  async execute(pokemon: CrySource, { onStart }: PlayOptions = {}): Promise<void> {
    if (!pokemon.cryUrl) {
      throw new AppError(ErrorKind.NotFound, `Pokémon ${pokemon.id} has no cry`);
    }
    const key = this.keyFor(pokemon);
    const uri = (await this.media.find(key)) ?? (await this.media.download(key, pokemon.cryUrl));

    onStart?.();
    await this.player.play(uri);
  }

  stop(): void {
    this.player.stop();
  }

  private keyFor(pokemon: CrySource): string {
    // PokéAPI files are Ogg Vorbis, a few are MP3 under the same name; the player
    // detects the real format from the content.
    return `cry-${pokemon.id}.ogg`;
  }
}

export interface SoundPlayer {
  /** Starts playing `uri`; resolves when the sound ends or is stopped. */
  play(uri: string): Promise<void>;
  stop(): void;
}

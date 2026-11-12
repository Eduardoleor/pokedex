import { type AudioBufferSourceNode, AudioContext, AudioManager } from 'react-native-audio-api';

import { AppError, ErrorKind } from '@/domain/errors';
import type { SoundPlayer } from '@/domain/ports';

/**
 * Decodes the file in native code (libvorbis / OS decoders), so Ogg Vorbis cries
 * play on iOS too, where AVFoundation cannot open them.
 */
export class AudioApiSoundPlayer implements SoundPlayer {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private settle: (() => void) | null = null;

  async play(uri: string): Promise<void> {
    this.stop();
    const context = this.getContext();

    let buffer;
    try {
      buffer = await context.decodeAudioData(uri);
    } catch (error) {
      throw new AppError(ErrorKind.InvalidResponse, 'The sound could not be decoded', {
        originalError: error,
      });
    }
    if (context.state === 'suspended') {
      await context.resume();
    }

    return new Promise((resolve) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);

      const done = () => {
        source.onended = null;
        if (this.source === source) {
          this.source = null;
          this.settle = null;
        }
        resolve();
      };
      source.onended = done;

      this.source = source;
      this.settle = done;
      source.start();
    });
  }

  stop(): void {
    const { source, settle } = this;
    this.source = null;
    this.settle = null;
    if (source) {
      source.onended = null;
      source.stop();
    }
    settle?.();
  }

  private getContext(): AudioContext {
    if (!this.context) {
      // Cries are triggered by the user, so they play even with the silent switch on.
      AudioManager.setSystemOptions({ ios: { category: 'playback' } });
      this.context = new AudioContext();
    }
    return this.context;
  }
}

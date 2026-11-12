import type { MediaCache } from '@/domain/ports';

/** Streams from the original URL; used where there is no file system (web). */
export class RemoteMediaCache implements MediaCache {
  find(): Promise<string | null> {
    return Promise.resolve(null);
  }

  download(_key: string, remoteUrl: string): Promise<string> {
    return Promise.resolve(remoteUrl);
  }

  clear(): Promise<void> {
    return Promise.resolve();
  }
}

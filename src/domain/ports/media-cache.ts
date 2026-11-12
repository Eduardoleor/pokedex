/** Binary files (audio) kept on the device so they work offline. */
export interface MediaCache {
  /** Local URI of a saved file, or `null` if it was never downloaded. */
  find(key: string): Promise<string | null>;
  /** Downloads `remoteUrl`, stores it under `key` and returns the local URI. */
  download(key: string, remoteUrl: string): Promise<string>;
  /** Deletes every saved file. */
  clear(): Promise<void>;
}

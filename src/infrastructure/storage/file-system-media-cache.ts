import { Directory, File, Paths } from 'expo-file-system';

import { AppError, ErrorKind } from '@/domain/errors';
import type { MediaCache } from '@/domain/ports';

export class FileSystemMediaCache implements MediaCache {
  private readonly directory: Directory;

  constructor(namespace = 'media') {
    this.directory = new Directory(Paths.document, namespace);
  }

  find(key: string): Promise<string | null> {
    const file = this.fileFor(key);
    return Promise.resolve(file.exists ? file.uri : null);
  }

  async download(key: string, remoteUrl: string): Promise<string> {
    if (!this.directory.exists) {
      this.directory.create({ intermediates: true, idempotent: true });
    }
    const file = this.fileFor(key);
    try {
      const saved = await File.downloadFileAsync(remoteUrl, file, { idempotent: true });
      return saved.uri;
    } catch (error) {
      if (file.exists) {
        file.delete();
      }
      throw new AppError(ErrorKind.Network, `Could not download ${remoteUrl}`, {
        originalError: error,
      });
    }
  }

  clear(): Promise<void> {
    if (this.directory.exists) {
      this.directory.delete();
    }
    return Promise.resolve();
  }

  private fileFor(key: string): File {
    return new File(this.directory, key);
  }
}

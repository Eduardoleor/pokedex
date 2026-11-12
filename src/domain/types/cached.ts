import type { DataSource } from '../enums';
import type { AppError } from '../errors';

export interface Cached<T> {
  data: T;
  source: DataSource;
  /** Epoch milliseconds of the last successful fetch. */
  updatedAt: number;
  /** Older than the cache TTL; the caller should revalidate in the background. */
  isStale: boolean;
  /** Set when the network failed and saved data was served instead. */
  error: AppError | null;
}

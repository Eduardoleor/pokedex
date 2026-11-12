export interface PageRequest {
  offset: number;
  limit: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  nextOffset: number | null;
}

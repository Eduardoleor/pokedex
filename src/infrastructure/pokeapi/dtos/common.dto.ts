export interface NamedApiResourceDto {
  name: string;
  url: string;
}

export interface PaginatedResponseDto<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

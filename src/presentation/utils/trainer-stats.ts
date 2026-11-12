import { GENERATIONS } from './generations';

const DAY = 24 * 60 * 60 * 1000;

interface Dated {
  id: number;
  caughtAt: number | null;
}

export interface DayCount {
  key: string;
  /** Short weekday, e.g. "Mon". */
  label: string;
  count: number;
  isToday: boolean;
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Catches per calendar day over the last `days` days, oldest first, today last. */
export function catchesByDay(items: Dated[], days = 7, now = Date.now()): DayCount[] {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, index) => {
    const start = today - (days - 1 - index) * DAY;
    const end = start + DAY;
    return {
      key: String(start),
      label: new Date(start).toLocaleDateString(undefined, { weekday: 'short' }),
      count: items.filter(
        (item) => item.caughtAt !== null && item.caughtAt >= start && item.caughtAt < end,
      ).length,
      isToday: start === today,
    };
  });
}

export interface GenerationCount {
  label: string;
  count: number;
  total: number;
}

export function catchesByGeneration(items: Dated[]): GenerationCount[] {
  return GENERATIONS.map(({ label, first, last }) => ({
    label,
    count: items.filter((item) => item.id >= first && item.id <= last).length,
    total: last - first + 1,
  }));
}

export function formatCatchDate(timestamp: number | null): string {
  if (timestamp === null) {
    return 'Date unknown';
  }
  return new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Days since the earliest dated catch, counting today as day 1. */
export function trainerDays(items: Dated[], now = Date.now()): number {
  const dates = items
    .map((item) => item.caughtAt)
    .filter((value): value is number => value !== null);
  if (dates.length === 0) {
    return 0;
  }
  return Math.floor((startOfDay(now) - startOfDay(Math.min(...dates))) / DAY) + 1;
}

const RANKS = [
  { title: 'Rookie', from: 0 },
  { title: 'Beginner', from: 1 },
  { title: 'Ace Trainer', from: 10 },
  { title: 'Veteran', from: 50 },
  { title: 'Elite', from: 150 },
  { title: 'Pokémon Master', from: 500 },
] as const;

export interface TrainerRank {
  title: string;
  /** 1 + one level every five catches. */
  level: number;
  next: { title: string; remaining: number; progress: number } | null;
}

/** Title, level and the way to the next title for a number of catches. */
export function trainerRank(caught: number): TrainerRank {
  const index = RANKS.reduce((found, rank, i) => (caught >= rank.from ? i : found), 0);
  const current = RANKS[index] ?? RANKS[0];
  const upcoming = RANKS[index + 1];
  return {
    title: current.title,
    level: Math.floor(caught / 5) + 1,
    next: upcoming
      ? {
          title: upcoming.title,
          remaining: upcoming.from - caught,
          progress: (caught - current.from) / (upcoming.from - current.from),
        }
      : null,
  };
}

export function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

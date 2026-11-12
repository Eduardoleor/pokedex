import { StatName } from '@/domain/enums';

const STAT_LABELS: Record<StatName, string> = {
  [StatName.Hp]: 'HP',
  [StatName.Attack]: 'Attack',
  [StatName.Defense]: 'Defense',
  [StatName.SpecialAttack]: 'Sp. Atk',
  [StatName.SpecialDefense]: 'Sp. Def',
  [StatName.Speed]: 'Speed',
};

export function formatName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function formatHeight(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

export function formatWeight(kilograms: number): string {
  return `${kilograms.toFixed(1)} kg`;
}

export function formatStatName(name: StatName): string {
  return STAT_LABELS[name];
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < MINUTE) {
    return 'just now';
  }
  if (elapsed < HOUR) {
    return `${Math.floor(elapsed / MINUTE)} min ago`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / HOUR)} h ago`;
  }
  const days = Math.floor(elapsed / DAY);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

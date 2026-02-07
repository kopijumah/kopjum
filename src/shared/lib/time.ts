const DEFAULT_SECONDS = 86400

export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return DEFAULT_SECONDS

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: DEFAULT_SECONDS,
  }

  return Number.parseInt(match[1], 10) * (multipliers[match[2]] || DEFAULT_SECONDS)
}

export function formatDateTime(value: unknown): string {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.valueOf())) return '-'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(date)
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(value)
}

export function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0)
}

export function endOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999)
}

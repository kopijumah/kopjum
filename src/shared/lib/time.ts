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
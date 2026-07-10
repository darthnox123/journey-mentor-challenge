/** Parses an ISO 8601 duration like "PT7H30M" or "P1DT4H45M" into total minutes. */
export function parseIsoDuration(iso: string): number {
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?$/.exec(iso)
  if (!match) return 0
  const days = Number(match[1] ?? 0)
  const hours = Number(match[2] ?? 0)
  const minutes = Number(match[3] ?? 0)
  return days * 24 * 60 + hours * 60 + minutes
}

export function formatDuration(iso: string): string {
  const totalMinutes = parseIsoDuration(iso)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

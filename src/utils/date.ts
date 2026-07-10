export function shiftDate(dateStr: string, deltaDays: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + deltaDays)
  return date.toISOString().slice(0, 10)
}

export function formatDateLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

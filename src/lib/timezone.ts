// Sri Lanka Timezone (Asia/Colombo, UTC+5:30)
export const SL_TIMEZONE = 'Asia/Colombo'

export function formatTime(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', { timeZone: SL_TIMEZONE, ...opts })
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { timeZone: SL_TIMEZONE, ...opts })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', { timeZone: SL_TIMEZONE })
}

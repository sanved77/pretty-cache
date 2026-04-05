import { TIME_SLOTS } from './constants'

export function getGreeting(): string {
  const h = new Date().getHours()
  const slot = TIME_SLOTS.find((s) =>
    s.start < s.end ? h >= s.start && h < s.end : h >= s.start || h < s.end,
  )
  return `Good ${slot?.label ?? 'day'}`
}

export function getTimeHint(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return 'Early start — set your priorities'
  if (h >= 9 && h < 12) return 'Peak focus window — deep work time'
  if (h >= 12 && h < 14) return 'Midday — review progress'
  if (h >= 14 && h < 17) return 'Afternoon push — finish strong'
  if (h >= 17 && h < 21) return 'Winding down — wrap up loose ends'
  return 'Night owl — plan for tomorrow'
}

export function getDayProgress(): number {
  const now = new Date()
  const h = now.getHours() + now.getMinutes() / 60
  const start = 9
  const end = 18
  if (h <= start) return 0
  if (h >= end) return 100
  return ((h - start) / (end - start)) * 100
}

export function formatClock(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `Captured ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Captured ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Captured yesterday'
  return `Captured ${days}d ago`
}

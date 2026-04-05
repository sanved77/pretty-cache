import { APP_FONT_FAMILY } from '../../../../styles/appFont'

export const MONO = APP_FONT_FAMILY

export const STATUS_COLORS: Record<string, string> = {
  Open: '#22c55e',
  Close: '#64748b',
  Paused: '#facc15',
  Blocked: '#ef4444',
}

export const TIME_SLOTS = [
  { start: 5, end: 12, label: 'morning' },
  { start: 12, end: 17, label: 'afternoon' },
  { start: 17, end: 21, label: 'evening' },
  { start: 21, end: 5, label: 'night' },
] as const

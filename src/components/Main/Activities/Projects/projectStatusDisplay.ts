import type { ProjectStatus } from '../../../../types/projects'

export function getDisplayStatus(status: ProjectStatus | undefined): ProjectStatus {
  return status ?? 'Open'
}

export function statusPillSx(status: ProjectStatus): {
  bgcolor: string
  color: string
} {
  switch (status) {
    case 'Open':
      return { bgcolor: 'rgba(76, 175, 80, 0.2)', color: 'var(--status-open)' }
    case 'Close':
      return { bgcolor: 'rgba(100, 181, 246, 0.2)', color: 'var(--status-close)' }
    case 'Paused':
      return { bgcolor: 'rgba(253, 216, 53, 0.2)', color: 'var(--status-paused)' }
    case 'Blocked':
      return { bgcolor: 'rgba(251, 140, 0, 0.2)', color: 'var(--status-blocked)' }
    default:
      return { bgcolor: 'rgba(76, 175, 80, 0.2)', color: 'var(--status-open)' }
  }
}

import type { LinkObj } from '../types/projects'
import { readTrackedStorage } from './trackedStorage'

const STORAGE_KEY = 'projects'

export type TrackedFavoriteLinkRow = {
  linkId: string
  projectId: string
  label: string
  url: string
  type?: string
  visits: number
}

/** Resolve favorite link ids from `tracked` against projects in localStorage (same source as useProjects). */
export function readTrackedFavoriteLinksSnapshot(): TrackedFavoriteLinkRow[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const tracked = readTrackedStorage().links ?? []
    const projects = parsed as { id: string; links?: LinkObj[] }[]
    const out: TrackedFavoriteLinkRow[] = []
    for (const linkId of tracked) {
      for (const p of projects) {
        const link = (p.links ?? []).find((l) => l.id === linkId)
        if (link) {
          out.push({
            linkId,
            projectId: p.id,
            label: link.label,
            url: link.url,
            type: link.type,
            visits: link.visits ?? 0,
          })
          break
        }
      }
    }
    return out
  } catch {
    return []
  }
}

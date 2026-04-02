import type { Project } from '../types/projects'
import { readTrackedStorage } from './trackedStorage'

const STORAGE_KEY = 'projects'

/** Read tracked projects from localStorage (same source as useProjects). For sidebar sync across hook instances. */
export function readTrackedProjectsSnapshot(): Project[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const tracked = readTrackedStorage().projects ?? []
    const projects = parsed as Project[]
    const out: Project[] = []
    for (const id of tracked) {
      const p = projects.find((x) => x.id === id)
      if (p) out.push(p)
    }
    return out
  } catch {
    return []
  }
}

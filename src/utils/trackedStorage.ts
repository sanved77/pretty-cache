export const TRACKED_STORAGE_KEY = 'tracked'

const MAX_RECENT_LINKS = 5

export interface TrackedStorage {
  task: string
  projects?: string[]
  links?: string[]
  recents?: string[]
}

export function readTrackedStorage(): TrackedStorage {
  if (typeof window === 'undefined')
    return { task: '', projects: [], links: [], recents: [] }
  try {
    const raw = localStorage.getItem(TRACKED_STORAGE_KEY)
    if (raw === null) return { task: '', projects: [], links: [], recents: [] }
    const parsed = JSON.parse(raw) as unknown
    if (parsed == null || typeof parsed !== 'object')
      return { task: '', projects: [], links: [], recents: [] }
    const o = parsed as Record<string, unknown>

    // Backward compat: migrate old tasks array to single task string
    let task = ''
    if (typeof o.task === 'string') {
      task = o.task
    } else if (Array.isArray(o.tasks) && o.tasks.length > 0 && typeof o.tasks[0] === 'string') {
      task = o.tasks[0] as string
    }

    const projects =
      Array.isArray(o.projects) && o.projects.every((id): id is string => typeof id === 'string')
        ? o.projects
        : []
    const links =
      Array.isArray(o.links) && o.links.every((id): id is string => typeof id === 'string')
        ? o.links
        : []
    const recents =
      Array.isArray(o.recents) && o.recents.every((id): id is string => typeof id === 'string')
        ? o.recents
        : []
    return { task, projects, links, recents }
  } catch {
    return { task: '', projects: [], links: [], recents: [] }
  }
}

export function writeTrackedTask(taskId: string): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const payload: TrackedStorage = {
    task: taskId,
    projects: prev.projects ?? [],
    links: prev.links ?? [],
    recents: prev.recents ?? [],
  }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
}

export function writeTrackedProjects(projectIds: string[]): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const payload: TrackedStorage = {
    task: prev.task ?? '',
    projects: projectIds,
    links: prev.links ?? [],
    recents: prev.recents ?? [],
  }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
}

export function writeTrackedLinks(linkIds: string[]): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const payload: TrackedStorage = {
    task: prev.task ?? '',
    projects: prev.projects ?? [],
    links: linkIds,
    recents: prev.recents ?? [],
  }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
}

/** Most recent first, max 5 link ids. Dedupes by moving clicked id to front. */
export function pushRecentLink(linkId: string): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const without = (prev.recents ?? []).filter((id) => id !== linkId)
  const recents = [linkId, ...without].slice(0, MAX_RECENT_LINKS)
  const payload: TrackedStorage = {
    task: prev.task ?? '',
    projects: prev.projects ?? [],
    links: prev.links ?? [],
    recents,
  }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent('missioncontrol-projects-updated'))
}

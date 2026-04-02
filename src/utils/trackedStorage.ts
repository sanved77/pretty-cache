export const TRACKED_STORAGE_KEY = 'tracked'

export interface TrackedStorage {
  tasks: string[]
  projects?: string[]
}

export function readTrackedStorage(): TrackedStorage {
  if (typeof window === 'undefined') return { tasks: [], projects: [] }
  try {
    const raw = localStorage.getItem(TRACKED_STORAGE_KEY)
    if (raw === null) return { tasks: [], projects: [] }
    const parsed = JSON.parse(raw) as unknown
    if (parsed == null || typeof parsed !== 'object') return { tasks: [], projects: [] }
    const o = parsed as Record<string, unknown>
    const tasks = Array.isArray(o.tasks) && o.tasks.every((id): id is string => typeof id === 'string')
      ? o.tasks
      : []
    const projects =
      Array.isArray(o.projects) && o.projects.every((id): id is string => typeof id === 'string')
        ? o.projects
        : []
    return { tasks, projects }
  } catch {
    return { tasks: [], projects: [] }
  }
}

export function writeTrackedTasks(taskIds: string[]): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const payload: TrackedStorage = { tasks: taskIds, projects: prev.projects ?? [] }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
}

export function writeTrackedProjects(projectIds: string[]): void {
  if (typeof window === 'undefined') return
  const prev = readTrackedStorage()
  const payload: TrackedStorage = { tasks: prev.tasks, projects: projectIds }
  localStorage.setItem(TRACKED_STORAGE_KEY, JSON.stringify(payload))
}

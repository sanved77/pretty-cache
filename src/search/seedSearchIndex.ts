import type { Project, Task } from '../types/projects'
import {
  addMany,
  clear,
  setSeeding,
  type SearchIndexEntry,
} from './SearchIndexManager'

function tryParseJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function hostname(url: string): string | undefined {
  if (!url || url === '#') return undefined
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

function buildProjectMeta(project: Project, tasks: Task[]): string {
  const parts: string[] = []
  if (project.status) parts.push(project.status)

  const projectTasks = tasks.filter(
    (t) => t.projectID === project.id && !(t.isArchived ?? false),
  )
  if (projectTasks.length > 0) {
    const done = projectTasks.filter((t) => t.completedOn != null).length
    const pct = Math.round((done / projectTasks.length) * 100)
    parts.push(`${pct}% done`)
  }

  if (project.deadlineOn) {
    const daysLeft = Math.ceil(
      (project.deadlineOn - Date.now()) / (1000 * 60 * 60 * 24),
    )
    if (daysLeft > 0) parts.push(`${daysLeft}d left`)
    else if (daysLeft === 0) parts.push('due today')
    else parts.push(`${Math.abs(daysLeft)}d overdue`)
  }

  return parts.join(' · ')
}

export function seedSearchIndex(): void {
  setSeeding(true)
  clear()

  const entries: SearchIndexEntry[] = []

  // --- Static pages ---
  entries.push(
    { id: 'page-today', type: 'page', content: 'Today', route: '/' },
    { id: 'page-scratchpad', type: 'page', content: 'Scratchpad', route: '/scratchpad' },
    { id: 'page-projects', type: 'page', content: 'Projects', route: '/projects' },
    { id: 'page-settings', type: 'page', content: 'Settings', route: '/settings' },
    { id: 'page-daily-logs', type: 'page', content: 'Daily Logs', route: '/' },
  )

  // --- Static actions ---
  entries.push(
    { id: 'action-create-project', type: 'action', content: 'Create Project' },
    { id: 'action-add-parking-lot', type: 'action', content: 'Add Parking Lot' },
    { id: 'action-add-today-plan', type: 'action', content: "Add to Today's Plan" },
    { id: 'action-export-backup', type: 'action', content: 'Export Backup' },
    { id: 'action-import', type: 'action', content: 'Import' },
  )

  // --- Dynamic entities ---
  const projects = tryParseJson<Project[]>('projects') ?? []
  const tasks = tryParseJson<Task[]>('tasks') ?? []

  const subTaskIds = new Set<string>()
  for (const t of tasks) {
    for (const id of t.subTasks ?? []) subTaskIds.add(id)
  }

  for (const p of projects) {
    entries.push({
      id: p.id,
      type: 'project',
      content: p.projectName,
      route: `/projects/${p.id}`,
      meta: buildProjectMeta(p, tasks),
    })

    for (const link of p.links ?? []) {
      const host = hostname(link.url)
      const metaParts = [host, p.projectName].filter(Boolean)
      entries.push({
        id: link.id,
        type: 'link',
        content: link.label,
        hyperlink: link.url,
        meta: metaParts.join(' · '),
        projectSource: p.id,
      })
    }
  }

  for (const t of tasks) {
    if (t.completedOn != null) continue
    if (t.isArchived) continue
    if (subTaskIds.has(t.id)) continue

    const project = projects.find((p) => p.id === t.projectID)
    entries.push({
      id: t.id,
      type: 'task',
      content: t.content,
      route: t.projectID ? `/projects/${t.projectID}` : undefined,
      meta: project?.projectName,
      projectSource: t.projectID,
    })
  }

  addMany(entries)
  setSeeding(false)
}

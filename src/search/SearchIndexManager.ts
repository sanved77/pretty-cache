export interface SearchIndexEntry {
  id: string
  type: 'page' | 'project' | 'link' | 'action' | 'task'
  content: string
  route?: string
  hyperlink?: string
  meta?: string
  projectSource?: string
}

let entries: SearchIndexEntry[] = []
let _seeding = false

export const SEEDING_CHANGED_EVENT = 'search-index-seeding-changed'

export function isSeeding(): boolean {
  return _seeding
}

export function setSeeding(v: boolean): void {
  _seeding = v
  window.dispatchEvent(new CustomEvent(SEEDING_CHANGED_EVENT))
}

export function getAll(): SearchIndexEntry[] {
  return entries
}

export function add(entry: SearchIndexEntry): void {
  entries.push(entry)
}

export function addMany(newEntries: SearchIndexEntry[]): void {
  entries.push(...newEntries)
}

export function remove(id: string): void {
  entries = entries.filter((e) => e.id !== id)
}

export function removeByProject(projectId: string): void {
  entries = entries.filter(
    (e) => e.id !== projectId && e.projectSource !== projectId,
  )
}

export function has(id: string): boolean {
  return entries.some((e) => e.id === id)
}

export function clear(): void {
  entries = []
}

/** Keys used by useProjects, useTasks, useScratchpadNotes — keep in sync with those hooks. */
const STORAGE_KEYS = ['projects', 'tasks', 'tracked', 'notes'] as const

export type MissionControlStorageExport = {
  version: 1
  exportedAt: number
  projects: unknown
  tasks: unknown
  tracked: unknown
  notes: unknown
}

function parseStored(key: (typeof STORAGE_KEYS)[number]): unknown {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

/**
 * Reads all Mission Control localStorage keys, logs a versioned object, and returns it.
 * Use from the dev console: `missionControl.export()`
 */
export function exportMissionControlStorage(): MissionControlStorageExport {
  const envelope: MissionControlStorageExport = {
    version: 1,
    exportedAt: Date.now(),
    projects: parseStored('projects'),
    tasks: parseStored('tasks'),
    tracked: parseStored('tracked'),
    notes: parseStored('notes'),
  }
  console.log('[Mission Control] storage export', envelope)
  return envelope
}

/**
 * Writes any provided storage keys from an object into localStorage, then reloads the page.
 * Accepts a full export from `export()` or a partial object with only the keys to update.
 * Use `null` for a key to remove it from localStorage.
 * Use from the dev console: `missionControl.importData({ ... })`
 */
export function importMissionControlStorage(data: unknown): void {
  if (data == null || typeof data !== 'object') {
    throw new Error('[Mission Control] import: expected a non-null object')
  }
  const o = data as Record<string, unknown>
  const version = o.version
  if (version !== undefined && version !== 1) {
    console.warn('[Mission Control] import: unexpected version', version)
  }
  for (const key of STORAGE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(o, key)) continue
    const value = o[key]
    if (value === undefined) continue
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
  window.location.reload()
}

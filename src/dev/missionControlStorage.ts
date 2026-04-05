/**
 * Full localStorage surface for Mission Control export/import.
 * Keep in sync with hooks that persist to localStorage.
 */
export const JSON_STORAGE_KEYS = [
  'projects',
  'tasks',
  'tracked',
  'notes',
  'blockers',
  'questions',
  'logs',
  'parkingLot',
  'today',
] as const

export type JsonStorageKey = (typeof JSON_STORAGE_KEYS)[number]

export const USER_FULL_NAME_KEY = 'userFullName'

export const USER_NAME_CHANGED_EVENT = 'missioncontrol-user-name-changed'

export type MissionControlStorageExport = {
  version: 1
  exportedAt: number
  userFullName: string
} & Record<JsonStorageKey, unknown>

function parseStored(key: JsonStorageKey): unknown {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function readUserFullName(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(USER_FULL_NAME_KEY) ?? ''
}

function validateImportedValue(key: JsonStorageKey, value: unknown): string | null {
  if (value === null) return null
  switch (key) {
    case 'tracked':
      return typeof value === 'object' && !Array.isArray(value)
        ? null
        : 'tracked must be an object or null'
    case 'notes':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return 'notes must be an object or null'
      }
      if (!('content' in value) || typeof (value as { content: unknown }).content !== 'string') {
        return 'notes must have a string content field'
      }
      return null
    default:
      return Array.isArray(value) ? null : `${key} must be an array or null`
  }
}

export type ValidateImportResult =
  | { ok: true; data: MissionControlStorageExport }
  | { ok: false; error: string }

/**
 * Validates a parsed JSON object from an export file.
 */
export function validateMissionControlImport(data: unknown): ValidateImportResult {
  if (data == null || typeof data !== 'object') {
    return { ok: false, error: 'File must contain a JSON object' }
  }
  const o = data as Record<string, unknown>
  if (o.version !== 1) {
    return { ok: false, error: 'Expected version: 1' }
  }
  if (typeof o.userFullName !== 'string') {
    return { ok: false, error: 'Missing or invalid userFullName' }
  }
  for (const key of JSON_STORAGE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(o, key)) {
      return { ok: false, error: `Missing key: ${key}` }
    }
    const err = validateImportedValue(key, o[key])
    if (err) return { ok: false, error: err }
  }
  return { ok: true, data: o as MissionControlStorageExport }
}

/**
 * Writes validated export payload to localStorage and reloads the page.
 */
export function applyMissionControlImport(data: MissionControlStorageExport): void {
  for (const key of JSON_STORAGE_KEYS) {
    const value = data[key]
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
  localStorage.setItem(USER_FULL_NAME_KEY, data.userFullName)
  window.location.reload()
}

/**
 * Reads all Mission Control localStorage keys and returns a versioned export object.
 * Use from the dev console: `missionControl.export()`
 */
export function exportMissionControlStorage(): MissionControlStorageExport {
  const envelope = {
    version: 1 as const,
    exportedAt: Date.now(),
    userFullName: readUserFullName(),
    ...Object.fromEntries(JSON_STORAGE_KEYS.map((k) => [k, parseStored(k)])),
  } as MissionControlStorageExport
  if (import.meta.env.DEV) {
    console.log('[Mission Control] storage export', envelope)
  }
  return envelope
}

/**
 * Triggers a browser download of the current storage as JSON.
 */
export function downloadMissionControlExport(): void {
  const data = exportMissionControlStorage()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mission-control-export-${new Date().toISOString().slice(0, 10)}.json`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validates and imports storage from a parsed export object, then reloads.
 * Use from the dev console: `missionControl.importData({ ... })`
 */
export function importMissionControlStorage(data: unknown): void {
  const result = validateMissionControlImport(data)
  if (!result.ok) {
    throw new Error(`[Mission Control] import: ${result.error}`)
  }
  applyMissionControlImport(result.data)
}

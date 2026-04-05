import { useState, useEffect, useCallback } from 'react'
import type { Blocker } from '../types/projects'
import { storageEvents } from '../utils/storageEvents'

const STORAGE_KEY = 'blockers'

function readBlockers(): Blocker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (b): b is Blocker =>
        b != null &&
        typeof b === 'object' &&
        typeof (b as Record<string, unknown>).id === 'string' &&
        typeof (b as Record<string, unknown>).text === 'string' &&
        typeof (b as Record<string, unknown>).projectId === 'string',
    )
  } catch {
    return []
  }
}

export function useBlockers() {
  const [blockers, setBlockers] = useState<Blocker[]>(readBlockers)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blockers))
  }, [blockers])

  const getBlockersForProject = useCallback(
    (projectId: string): Blocker[] =>
      blockers.filter((b) => b.projectId === projectId),
    [blockers],
  )

  const addBlocker = useCallback((projectId: string, text: string): string => {
    const id = crypto.randomUUID()
    const blocker: Blocker = { id, text: text.trim(), projectId }
    setBlockers((prev) => [...prev, blocker])
    storageEvents.publish({ type: 'blocker-added', content: { id, contentType: 'blocker' }, timestamp: Date.now(), contentText: text.trim() })
    return id
  }, [])

  const dismissBlocker = useCallback((blockerId: string) => {
    setBlockers((prev) =>
      prev.map((b) =>
        b.id === blockerId ? { ...b, dismissedOn: Date.now() } : b,
      ),
    )
    storageEvents.publish({ type: 'blocker-dismissed', content: { id: blockerId, contentType: 'blocker' }, timestamp: Date.now() })
  }, [])

  const undismissBlocker = useCallback((blockerId: string) => {
    setBlockers((prev) =>
      prev.map((b) => {
        if (b.id !== blockerId) return b
        const { dismissedOn: _, ...rest } = b
        return rest
      }),
    )
  }, [])

  const removeBlockersForProject = useCallback((projectId: string) => {
    setBlockers((prev) => prev.filter((b) => b.projectId !== projectId))
  }, [])

  return {
    blockers,
    getBlockersForProject,
    addBlocker,
    dismissBlocker,
    undismissBlocker,
    removeBlockersForProject,
  }
}

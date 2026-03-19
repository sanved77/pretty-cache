import { useState, useEffect, useCallback } from 'react'
import type { LinkObj, Project } from '../types/projects'

const STORAGE_KEY = 'projects'

function ensureLinkIds(links: LinkObj[]): LinkObj[] {
  return links.map((l) => (l.id ? l : { ...l, id: crypto.randomUUID() }))
}

function isValidBlockerEntry(item: unknown): item is { text: string; dismissed?: boolean } {
  if (item == null || typeof item !== 'object') return false
  const o = item as Record<string, unknown>
  return typeof o.text === 'string'
}

function isValidProject(item: unknown): item is Project {
  if (item == null || typeof item !== 'object') return false
  const o = item as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    typeof o.projectName !== 'string' ||
    typeof o.description !== 'string' ||
    !Array.isArray(o.blockers) ||
    !Array.isArray(o.questions) ||
    !Array.isArray(o.links) ||
    typeof o.createdOn !== 'number'
  )
    return false
  return (o.blockers as unknown[]).every(isValidBlockerEntry)
}

function getProjectsFromStorage(): Project[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    if (parsed.length === 0) return null
    for (const item of parsed) {
      if (!isValidProject(item)) return null
    }
    const projects = parsed as Project[]
    return projects.map((p) => ({
      ...p,
      links: ensureLinkIds(p.links ?? []),
    }))
  } catch {
    return null
  }
}

export function useProjects(): {
  projects: Project[]
  setBlockerDismissed: (projectId: string, blockerIndex: number) => void
  addBlocker: (projectId: string, text: string) => void
  addQuestion: (projectId: string, text: string) => void
  addLink: (projectId: string, link: { label: string; url: string; type?: string }) => void
  updateLink: (projectId: string, linkId: string, update: { label: string; url: string; type: string }) => void
  deleteLink: (projectId: string, linkId: string) => void
  updateProjectName: (projectId: string, projectName: string) => void
  updateProjectDescription: (projectId: string, description: string) => void
} {
  const [projects, setProjects] = useState<Project[]>(() => getProjectsFromStorage() ?? [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  const setBlockerDismissed = useCallback((projectId: string, blockerIndex: number) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !Array.isArray(p.blockers) || blockerIndex < 0 || blockerIndex >= p.blockers.length)
          return p
        const blockers = p.blockers.map((b, i) => (i === blockerIndex ? { ...b, dismissed: true } : b))
        return { ...p, blockers }
      })
    )
  }, [])

  const addBlocker = useCallback((projectId: string, text: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const blockers = [...(p.blockers ?? []), { text }]
        return { ...p, blockers }
      })
    )
  }, [])

  const addQuestion = useCallback((projectId: string, text: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const questions = [...(p.questions ?? []), text]
        return { ...p, questions }
      })
    )
  }, [])

  const addLink = useCallback((projectId: string, link: { label: string; url: string; type?: string }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const newLink = { ...link, id: crypto.randomUUID() }
        const links = [...(p.links ?? []), newLink]
        return { ...p, links }
      })
    )
  }, [])

  const updateLink = useCallback(
    (projectId: string, linkId: string, update: { label: string; url: string; type: string }) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          const links = (p.links ?? []).map((l) =>
            l.id === linkId ? { ...l, ...update } : l
          )
          return { ...p, links }
        })
      )
    },
    []
  )

  const deleteLink = useCallback((projectId: string, linkId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const links = (p.links ?? []).filter((l) => l.id !== linkId)
        return { ...p, links }
      })
    )
  }, [])

  const updateProjectName = useCallback((projectId: string, projectName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, projectName } : p)))
  }, [])

  const updateProjectDescription = useCallback((projectId: string, description: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, description } : p)))
  }, [])

  return {
    projects,
    setBlockerDismissed,
    addBlocker,
    addQuestion,
    addLink,
    updateLink,
    deleteLink,
    updateProjectName,
    updateProjectDescription,
  }
}

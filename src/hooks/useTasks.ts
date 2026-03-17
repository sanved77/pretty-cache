import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../types/projects'

const STORAGE_KEY = 'tasks'

function isValidTask(item: unknown): item is Task {
  if (item == null || typeof item !== 'object') return false
  const o = item as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.content === 'string' &&
    typeof o.createdOn === 'number' &&
    (o.completedOn === undefined || typeof o.completedOn === 'number') &&
    (o.projectID === undefined || typeof o.projectID === 'string') &&
    (o.subTasks === undefined || Array.isArray(o.subTasks))
  )
}

function getTasksFromStorage(): Task[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    if (parsed.length === 0) return null
    for (const item of parsed) {
      if (!isValidTask(item)) return null
    }
    return parsed as Task[]
  } catch {
    return null
  }
}

function getFakeTasks(): Task[] {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const projectId = 'proj-1'
  const t1 = 'task-1'
  const t2 = 'task-2'
  const t3 = 'task-3'
  const t4 = 'task-4'
  const t5 = 'task-5'
  const t6 = 'task-6'
  const t7 = 'task-7'

  return [
    {
      id: t1,
      content: 'Architectural Redesign: Auth Module',
      createdOn: now - 14 * day,
      deadlineOn: now + 4 * day,
      completedOn: undefined,
      projectID: projectId,
      subTasks: [t3, t4, t5, t6],
    },
    {
      id: t2,
      content: 'Performance Optimization (v2.1)',
      createdOn: now - 7 * day,
      deadlineOn: now + 12 * day,
      completedOn: undefined,
      projectID: projectId,
      subTasks: [t7],
    },
    {
      id: t3,
      content: 'Audit existing JWT implementation',
      createdOn: now - 10 * day,
      completedOn: now - 2 * day,
      projectID: projectId,
      subTasks: [],
    },
    {
      id: t4,
      content: 'Define new schema for OAuth providers',
      createdOn: now - 10 * day,
      completedOn: now - 1 * day,
      projectID: projectId,
      subTasks: [],
    },
    {
      id: t5,
      content: 'Implement multi-tenant session management',
      createdOn: now - 8 * day,
      completedOn: undefined,
      projectID: projectId,
      subTasks: [],
    },
    {
      id: t6,
      content: 'Write migration scripts for legacy users',
      createdOn: now - 6 * day,
      completedOn: undefined,
      projectID: projectId,
      subTasks: [],
    },
    {
      id: t7,
      content: 'Profile database query bottlenecks',
      createdOn: now - 5 * day,
      completedOn: now - 1 * day,
      projectID: projectId,
      subTasks: [],
    },
  ]
}

export function useTasks(): {
  tasks: Task[]
  setTaskComplete: (taskId: string, isComplete: boolean) => void
  addTask: (params: { content: string; parentTaskId?: string; projectId: string }) => void
  updateTask: (taskId: string, content: string) => void
} {
  const [tasks, setTasks] = useState<Task[]>(() => getTasksFromStorage() ?? getFakeTasks())

  useEffect(() => {
    const stored = getTasksFromStorage()
    if (stored === null || stored.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getFakeTasks()))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const setTaskComplete = useCallback((taskId: string, isComplete: boolean) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          completedOn: isComplete ? Date.now() : undefined,
        }
      })
    )
  }, [])

  const addTask = useCallback(
    ({ content, parentTaskId, projectId }: { content: string; parentTaskId?: string; projectId: string }) => {
      const newTask: Task = {
        id: crypto.randomUUID(),
        content: content.trim(),
        createdOn: Date.now(),
        projectID: projectId,
        subTasks: [],
      }
      setTasks((prev) => {
        const next = [...prev, newTask]
        if (parentTaskId != null) {
          return next.map((t) =>
            t.id === parentTaskId ? { ...t, subTasks: [...(t.subTasks ?? []), newTask.id] } : t
          )
        }
        return next
      })
    },
    []
  )

  const updateTask = useCallback((taskId: string, content: string) => {
    const trimmed = content.trim()
    setTasks((prev) =>
      prev.map((t) => (t.id !== taskId ? t : { ...t, content: trimmed }))
    )
  }, [])

  return { tasks, setTaskComplete, addTask, updateTask }
}

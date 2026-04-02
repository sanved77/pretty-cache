import { useState, useEffect, useCallback } from 'react'
import type { Task } from '../types/projects'

import { readTrackedStorage, writeTrackedTasks } from '../utils/trackedStorage'

const STORAGE_KEY = 'tasks'

function getTrackedFromStorage(): string[] {
  return readTrackedStorage().tasks
}

function isValidTask(item: unknown): item is Task {
  if (item == null || typeof item !== 'object') return false
  const o = item as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.content === 'string' &&
    typeof o.createdOn === 'number' &&
    (o.completedOn === undefined || typeof o.completedOn === 'number') &&
    (o.projectID === undefined || typeof o.projectID === 'string') &&
    (o.subTasks === undefined || Array.isArray(o.subTasks)) &&
    (o.isArchived === undefined || typeof o.isArchived === 'boolean')
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
    return (parsed as Task[]).map((t) => ({
      ...t,
      isArchived: t.isArchived ?? false,
    }))
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

function collectTaskAndDescendantIds(taskId: string, tasks: Task[]): Set<string> {
  const set = new Set<string>([taskId])
  const task = tasks.find((t) => t.id === taskId)
  if (!task?.subTasks?.length) return set
  for (const id of task.subTasks) {
    collectTaskAndDescendantIds(id, tasks).forEach((s) => set.add(s))
  }
  return set
}

function findParentTaskId(taskId: string, tasks: Task[]): string | null {
  for (const t of tasks) {
    if (t.subTasks?.includes(taskId)) return t.id
  }
  return null
}

function duplicateTaskRecursive(
  task: Task,
  tasks: Task[],
  idMap: Map<string, string>,
  newTasks: Task[],
): Task {
  const newId = crypto.randomUUID()
  idMap.set(task.id, newId)
  const newSubTaskIds: string[] = []
  for (const childId of task.subTasks ?? []) {
    const child = tasks.find((t) => t.id === childId)
    if (child) {
      const newChild = duplicateTaskRecursive(child, tasks, idMap, newTasks)
      newSubTaskIds.push(newChild.id)
    }
  }
  const newTask: Task = {
    id: newId,
    content: task.content,
    createdOn: Date.now(),
    projectID: task.projectID,
    deadlineOn: task.deadlineOn,
    subTasks: newSubTaskIds,
    isArchived: false,
  }
  newTasks.push(newTask)
  return newTask
}

export function useTasks(): {
  tasks: Task[]
  setTaskComplete: (taskId: string, isComplete: boolean, completeSubtasks?: boolean) => void
  addTask: (params: { content: string; parentTaskId?: string; projectId: string }) => void
  updateTask: (taskId: string, content: string) => void
  deleteTask: (taskId: string) => void
  moveTask: (draggedTaskId: string, newParentTaskId: string | null) => void
  archiveTask: (taskId: string, archived?: boolean) => void
  duplicateTask: (taskId: string) => void
  isTaskTracked: (taskId: string) => boolean
  toggleTrackedTask: (taskId: string) => void
} {
  const [tasks, setTasks] = useState<Task[]>(() => getTasksFromStorage() ?? getFakeTasks())
  const [trackedTaskIds, setTrackedTaskIds] = useState<string[]>(() => getTrackedFromStorage())

  useEffect(() => {
    const stored = getTasksFromStorage()
    if (stored === null || stored.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getFakeTasks()))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    writeTrackedTasks(trackedTaskIds)
  }, [trackedTaskIds])

  const setTaskComplete = useCallback((taskId: string, isComplete: boolean, completeSubtasks: boolean = false) => {
    setTasks((prev) => {
      const taskIds = [taskId];
      if (completeSubtasks) {
        taskIds.push(...collectTaskAndDescendantIds(taskId, prev))
      }
      return prev.map((t) => {
        if (!taskIds.includes(t.id) || (t.isArchived ?? false)) return t
        return {
          ...t,
          completedOn: isComplete ? Date.now() : undefined,
        }
      })
    }
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

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const toDelete = collectTaskAndDescendantIds(taskId, prev)
      setTrackedTaskIds((ids) => ids.filter((id) => !toDelete.has(id)))
      return prev
        .filter((t) => !toDelete.has(t.id))
        .map((t) => ({
          ...t,
          subTasks: t.subTasks?.filter((id) => !toDelete.has(id)) ?? [],
        }))
    })
  }, [])

  const moveTask = useCallback(
    (draggedTaskId: string, newParentTaskId: string | null) => {
      if (newParentTaskId !== null && draggedTaskId === newParentTaskId) return
      setTasks((prev) => {
        if (newParentTaskId === null) {
          return prev.map((t) => {
            const subTasks = t.subTasks ?? []
            if (!subTasks.includes(draggedTaskId)) return t
            return { ...t, subTasks: subTasks.filter((id) => id !== draggedTaskId) }
          })
        }
        const descendants = collectTaskAndDescendantIds(draggedTaskId, prev)
        if (descendants.has(newParentTaskId)) return prev
        return prev.map((t) => {
          const subTasks = t.subTasks ?? []
          const hasDragged = subTasks.includes(draggedTaskId)
          const isNewParent = t.id === newParentTaskId
          if (hasDragged && !isNewParent) {
            return { ...t, subTasks: subTasks.filter((id) => id !== draggedTaskId) }
          }
          if (isNewParent && !subTasks.includes(draggedTaskId)) {
            return { ...t, subTasks: [...subTasks, draggedTaskId] }
          }
          return t
        })
      })
    },
    []
  )

  const archiveTask = useCallback((taskId: string, archived: boolean = true) => {
    setTasks((prev) => {
      const toArchive = collectTaskAndDescendantIds(taskId, prev)
      return prev.map((t) => (toArchive.has(t.id) ? { ...t, isArchived: archived } : t))
    })
  }, [])

  const isTaskTracked = useCallback(
    (taskId: string) => trackedTaskIds.includes(taskId),
    [trackedTaskIds],
  )

  const toggleTrackedTask = useCallback((taskId: string) => {
    setTrackedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    )
  }, [])

  const duplicateTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const source = prev.find((t) => t.id === taskId)
      if (!source) return prev
      const parentId = findParentTaskId(taskId, prev)
      const idMap = new Map<string, string>()
      const newTasks: Task[] = []
      const newRoot = duplicateTaskRecursive(source, prev, idMap, newTasks)
      let next = [...prev, ...newTasks]
      if (parentId != null) {
        const parent = next.find((t) => t.id === parentId)
        if (parent) {
          const subTasks = parent.subTasks ?? []
          const idx = subTasks.indexOf(taskId)
          const insertIdx = idx >= 0 ? idx + 1 : subTasks.length
          const newSubTasks = [
            ...subTasks.slice(0, insertIdx),
            newRoot.id,
            ...subTasks.slice(insertIdx),
          ]
          next = next.map((t) =>
            t.id === parentId ? { ...t, subTasks: newSubTasks } : t,
          )
        }
      }
      return next
    })
  }, [])

  return {
    tasks,
    setTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveTask,
    duplicateTask,
    isTaskTracked,
    toggleTrackedTask,
  }
}

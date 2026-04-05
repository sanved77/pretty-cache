import { useState, useEffect, useCallback, useRef } from 'react'
import type { Task } from '../types/projects'

import { readTrackedStorage, writeTrackedTask } from '../utils/trackedStorage'
import { storageEvents } from '../utils/storageEvents'
import * as SearchIndex from '../search/SearchIndexManager'

const STORAGE_KEY = 'tasks'

function getTrackedFromStorage(): string {
  return readTrackedStorage().task
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

/** Post-order: each child's subtree first (nested subtasks included), then the task itself */
function postOrderTaskIds(rootId: string, tasks: Task[]): string[] {
  const task = tasks.find((t) => t.id === rootId)
  if (!task) return [rootId]
  const out: string[] = []
  for (const childId of task.subTasks ?? []) {
    out.push(...postOrderTaskIds(childId, tasks))
  }
  out.push(rootId)
  return out
}

/**
 * Task ids that will receive a completion log, in post-order (deepest descendants first, root last).
 * Skips tasks already completed or archived — only newly completed work is logged.
 */
function getNewlyCompletedTaskIdsForLogs(
  taskId: string,
  completeSubtasks: boolean,
  tasks: Task[],
): string[] {
  const candidates = completeSubtasks
    ? Array.from(collectTaskAndDescendantIds(taskId, tasks))
    : [taskId]
  const newly = candidates.filter((id) => {
    const t = tasks.find((x) => x.id === id)
    return t != null && !(t.isArchived ?? false) && t.completedOn == null
  })
  if (newly.length === 0) return []
  if (!completeSubtasks || newly.length === 1) {
    return newly
  }
  const fullOrder = postOrderTaskIds(taskId, tasks)
  const set = new Set(newly)
  return fullOrder.filter((id) => set.has(id))
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
  trackedTaskId: string
  setTaskComplete: (taskId: string, isComplete: boolean, completeSubtasks?: boolean) => void
  addTask: (params: { content: string; parentTaskId?: string; projectId: string }) => void
  updateTask: (taskId: string, content: string) => void
  deleteTask: (taskId: string) => void
  removeTasksForProject: (projectId: string) => void
  moveTask: (draggedTaskId: string, newParentTaskId: string | null) => void
  archiveTask: (taskId: string, archived?: boolean) => void
  duplicateTask: (taskId: string) => void
  isTaskTracked: (taskId: string) => boolean
  toggleTrackedTask: (taskId: string) => void
} {
  const [tasks, setTasks] = useState<Task[]>(() => getTasksFromStorage() ?? getFakeTasks())
  const [trackedTaskId, setTrackedTaskId] = useState<string>(() => getTrackedFromStorage())
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

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
    writeTrackedTask(trackedTaskId)
  }, [trackedTaskId])

  const setTaskComplete = useCallback((taskId: string, isComplete: boolean, completeSubtasks: boolean = false) => {
    if (isComplete) {
      const idsToRemove = completeSubtasks
        ? Array.from(collectTaskAndDescendantIds(taskId, tasksRef.current))
        : [taskId]
      for (const id of idsToRemove) SearchIndex.remove(id)

      const logIds = getNewlyCompletedTaskIdsForLogs(
        taskId,
        completeSubtasks,
        tasksRef.current,
      )
      let ts = Date.now()
      for (const id of logIds) {
        storageEvents.publish({
          type: 'task-completed',
          content: { id, contentType: 'task' },
          timestamp: ts,
        })
        ts += 1
      }
    }
    setTasks((prev) => {
      const taskIds = completeSubtasks
        ? Array.from(collectTaskAndDescendantIds(taskId, prev))
        : [taskId]
      const now = Date.now()
      return prev.map((t) => {
        if (!taskIds.includes(t.id) || (t.isArchived ?? false)) return t
        return {
          ...t,
          completedOn: isComplete ? now : undefined,
        }
      })
    })
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
      storageEvents.publish({ type: 'task-added', content: { id: newTask.id, contentType: 'task' }, timestamp: Date.now(), contentText: newTask.content })
      if (parentTaskId == null) {
        const projects: Array<{ id: string; projectName: string }> = (() => {
          try { return JSON.parse(localStorage.getItem('projects') ?? '[]') } catch { return [] }
        })()
        const project = projects.find((p) => p.id === projectId)
        SearchIndex.add({
          id: newTask.id,
          type: 'task',
          content: newTask.content,
          route: `/projects/${projectId}`,
          meta: project?.projectName,
          projectSource: projectId,
        })
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
    const toRemoveFromIndex = collectTaskAndDescendantIds(taskId, tasksRef.current)
    for (const id of toRemoveFromIndex) SearchIndex.remove(id)
    setTasks((prev) => {
      const toDelete = collectTaskAndDescendantIds(taskId, prev)
      setTrackedTaskId((cur) => (toDelete.has(cur) ? '' : cur))
      return prev
        .filter((t) => !toDelete.has(t.id))
        .map((t) => ({
          ...t,
          subTasks: t.subTasks?.filter((id) => !toDelete.has(id)) ?? [],
        }))
    })
  }, [])

  const removeTasksForProject = useCallback((projectId: string) => {
    const taskIds = tasksRef.current
      .filter((t) => t.projectID === projectId)
      .map((t) => t.id)
    for (const id of taskIds) SearchIndex.remove(id)
    setTasks((prev) => {
      const toRemove = new Set(
        prev.filter((t) => t.projectID === projectId).map((t) => t.id),
      )
      if (toRemove.size === 0) return prev
      setTrackedTaskId((cur) => (toRemove.has(cur) ? '' : cur))
      return prev
        .filter((t) => t.projectID !== projectId)
        .map((t) => ({
          ...t,
          subTasks: t.subTasks?.filter((id) => !toRemove.has(id)) ?? [],
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
    if (archived) {
      const ids = collectTaskAndDescendantIds(taskId, tasksRef.current)
      for (const id of ids) SearchIndex.remove(id)
    }
    setTasks((prev) => {
      const toArchive = collectTaskAndDescendantIds(taskId, prev)
      return prev.map((t) => (toArchive.has(t.id) ? { ...t, isArchived: archived } : t))
    })
  }, [])

  const isTaskTracked = useCallback(
    (taskId: string) => trackedTaskId === taskId,
    [trackedTaskId],
  )

  const toggleTrackedTask = useCallback((taskId: string) => {
    setTrackedTaskId((prev) => (prev === taskId ? '' : taskId))
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
    trackedTaskId,
    setTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    removeTasksForProject,
    moveTask,
    archiveTask,
    duplicateTask,
    isTaskTracked,
    toggleTrackedTask,
  }
}

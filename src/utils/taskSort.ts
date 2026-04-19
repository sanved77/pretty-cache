import type { Task } from '../types/projects'
import { isCompleted } from './taskCompletion'

export const TASK_LIST_SORT_STORAGE_KEY = 'prettycache-task-list-sort'

export type TaskCreatedSortOrder = 'oldest' | 'newest'

function compareByCreatedOn(a: Task, b: Task, order: TaskCreatedSortOrder): number {
  return order === 'oldest'
    ? a.createdOn - b.createdOn
    : b.createdOn - a.createdOn
}

/**
 * Incomplete tasks first, then completed; within each group sort by createdOn.
 */
export function sortTasksIncompleteFirst(
  tasks: Task[],
  taskMap: Map<string, Task>,
  order: TaskCreatedSortOrder,
): Task[] {
  const incomplete = tasks
    .filter((t) => isCompleted(t, taskMap) === 'incomplete')
    .sort((a, b) => compareByCreatedOn(a, b, order))
  const complete = tasks
    .filter((t) => isCompleted(t, taskMap) !== 'incomplete')
    .sort((a, b) => compareByCreatedOn(a, b, order))
  return [...incomplete, ...complete]
}

export function readTaskListSortOrder(): TaskCreatedSortOrder {
  if (typeof window === 'undefined') return 'oldest'
  try {
    const raw = localStorage.getItem(TASK_LIST_SORT_STORAGE_KEY)
    if (raw === 'newest' || raw === 'oldest') return raw
  } catch {
    /* ignore */
  }
  return 'oldest'
}

export function writeTaskListSortOrder(order: TaskCreatedSortOrder): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TASK_LIST_SORT_STORAGE_KEY, order)
  } catch {
    /* ignore */
  }
}

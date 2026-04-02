import type { Task } from '../types/projects'
import { isCompleted } from './taskCompletion'

export function getProjectTaskIds(tasks: Task[], projectId: string): Set<string> {
  const byProject = tasks.filter((t) => t.projectID === projectId)
  const ids = new Set<string>()
  function add(task: Task) {
    ids.add(task.id)
    for (const id of task.subTasks ?? []) {
      const child =
        byProject.find((t) => t.id === id) ?? tasks.find((t) => t.id === id)
      if (child) add(child)
    }
  }
  byProject.forEach(add)
  return ids
}

export function getProjectCompletion(
  tasks: Task[],
  projectId: string,
  taskMap: Map<string, Task>,
): { completed: number; total: number } {
  const ids = getProjectTaskIds(tasks, projectId)
  let completed = 0
  const total = ids.size
  for (const id of ids) {
    const t = taskMap.get(id)
    if (t && isCompleted(t, taskMap) === 'completed') completed++
  }
  return { completed, total }
}

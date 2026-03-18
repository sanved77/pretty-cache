import type { Task } from '../types/projects'

/**
 * Recursively determines if a task is completed.
 * - If the task has subtasks: returns true only when all subtasks are completed (AND).
 * - If the task has no subtasks: returns true when completedOn is set.
 */
export function isCompleted(task: Task | undefined, taskMap: Map<string, Task>): string {
  if (task == null) return 'incomplete';
  const subTasks = task.subTasks
  if (subTasks == null || subTasks.length === 0) {
    if(task.isArchived ?? false){
      return 'archived';
    }else if(task.completedOn != null) {
      return 'completed';
    }
    return 'incomplete';
  }
  if(subTasks.every((id) => isCompleted(taskMap.get(id), taskMap) !== 'incomplete')){
    return 'completed';
  }
  return 'incomplete';
}

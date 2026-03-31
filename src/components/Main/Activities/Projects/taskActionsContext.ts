import { createContext } from "react";

export interface TaskActions {
  setTaskComplete: (
    taskId: string,
    isComplete: boolean,
    completeSubtasks?: boolean,
  ) => void;
  addTask: (params: {
    content: string;
    parentTaskId?: string;
    projectId: string;
  }) => void;
  updateTask: (taskId: string, content: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (
    draggedTaskId: string,
    newParentTaskId: string | null,
  ) => void;
  archiveTask: (taskId: string, archived?: boolean) => void;
  duplicateTask: (taskId: string) => void;
  isTaskTracked: (taskId: string) => boolean;
  toggleTrackedTask: (taskId: string) => void;
}

export const TaskActionsContext = createContext<TaskActions | null>(null);

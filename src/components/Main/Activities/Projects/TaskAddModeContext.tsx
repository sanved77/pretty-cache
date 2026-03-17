import { createContext } from 'react'

export type TaskAddMode = string | 'root' | undefined

export interface TaskAddModeContextValue {
  taskAddMode: TaskAddMode
  setTaskAddMode: (value: TaskAddMode) => void
}

export const TaskAddModeContext = createContext<TaskAddModeContextValue | null>(null)

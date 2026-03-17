import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { Box, Checkbox, IconButton, Typography } from '@mui/material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Add from '@mui/icons-material/Add'
import type { Task } from '../../../../types/projects'
import { isCompleted } from '../../../../utils/taskCompletion'
import { TaskAddModeContext } from './TaskAddModeContext'
import AddTaskInput from './AddTaskInput'

function getTaskCompletionPercent(task: Task, taskMap: Map<string, Task>): { completed: number; total: number } {
  const hasSubTasks = task.subTasks != null && task.subTasks.length > 0
  let completed = hasSubTasks 
    ? 0 : isCompleted(task, taskMap) 
    ? 1 : 0
  let total = hasSubTasks ? 0 : 1
  for (const id of task.subTasks ?? []) {
    const child = taskMap.get(id)
    if (child) {
      const sub = getTaskCompletionPercent(child, taskMap)
      completed += hasSubTasks ? sub.completed : 0
      total += sub.total
    }
  }
  return { completed, total }
}

function sortChildTasks(subTaskIds: string[], taskMap: Map<string, Task>): Task[] {
  const tasks = subTaskIds.map((id) => taskMap.get(id)).filter((t): t is Task => t != null)
  const incomplete = tasks.filter((t) => !isCompleted(t, taskMap)).sort((a, b) => a.createdOn - b.createdOn)
  const complete = tasks.filter((t) => isCompleted(t, taskMap)).sort((a, b) => a.createdOn - b.createdOn)
  return [...incomplete, ...complete]
}

export interface TaskItemProps {
  task: Task
  taskMap: Map<string, Task>
  indentLevel?: number
  onTaskComplete?: (taskId: string, isComplete: boolean) => void
  onAddTask?: (content: string, parentTaskId: string) => void
  projectId?: string
}

export default function TaskItem({ task, taskMap, indentLevel = 0, onTaskComplete, onAddTask, projectId }: TaskItemProps) {
  const addMode = useContext(TaskAddModeContext)
  const [isHovered, setIsHovered] = useState(false)
  const subTaskIds = task.subTasks ?? []
  const hasSubTasks = subTaskIds.length > 0
  const completed = isCompleted(task, taskMap)
  const { completed: completedCount, total } = getTaskCompletionPercent(task, taskMap)
  const percentText = hasSubTasks ? `${Math.round((completedCount / total) * 100)}% complete` : null
  const sortedChildren = sortChildTasks(subTaskIds, taskMap)
  const showAddIcon = isHovered && addMode?.setTaskAddMode

  return (
    <Box
      component={motion.div}
      layout
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      sx={{ mb: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          pl: indentLevel * 3,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Checkbox
          size="small"
          checked={completed}
          disabled={hasSubTasks}
          onChange={hasSubTasks ? undefined : () => onTaskComplete?.(task.id, !completed)}
          icon={<CheckBoxOutlineBlankIcon sx={{ color: 'var(--scratchpad-text-muted)' }} />}
          checkedIcon={<CheckBoxIcon sx={{ color: '#4caf50' }} />}
          sx={{ p: 0.25, mt: 0.25 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: completed ? 'var(--scratchpad-text-muted)' : 'var(--scratchpad-text)',
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {task.content}
          </Typography>
          {percentText != null && (
            <Typography variant="caption" sx={{ color: 'var(--scratchpad-text-muted)', display: 'block', mt: 0.25 }}>
              {percentText}
            </Typography>
          )}
        </Box>
        {showAddIcon && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              addMode?.setTaskAddMode(task.id)
            }}
            sx={{ color: 'var(--scratchpad-text-muted)', p: 0.25, mt: 0.25 }}
            aria-label="Add subtask"
          >
            <Add sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
      {sortedChildren.map((childTask) => (
        <TaskItem
          key={childTask.id}
          task={childTask}
          taskMap={taskMap}
          indentLevel={indentLevel + 1}
          onTaskComplete={onTaskComplete}
          onAddTask={onAddTask}
          projectId={projectId}
        />
      ))}
      {addMode?.taskAddMode === task.id && onAddTask && (
        <AddTaskInput
          indentLevel={indentLevel + 1}
          onSubmit={(content) => {
            onAddTask(content, task.id)
            addMode.setTaskAddMode(undefined)
          }}
          onCancel={() => addMode.setTaskAddMode(undefined)}
        />
      )}
    </Box>
  )
}

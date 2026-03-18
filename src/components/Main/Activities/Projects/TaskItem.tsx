import { useContext, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import Add from "@mui/icons-material/Add";
import Archive from "@mui/icons-material/Archive";
import Unarchive from "@mui/icons-material/Unarchive";
import Delete from "@mui/icons-material/Delete";
import type { Task } from "../../../../types/projects";
import { isCompleted } from "../../../../utils/taskCompletion";
import { TaskAddModeContext } from "./TaskAddModeContext";
import AddTaskInput from "./AddTaskInput";

export const TASK_TYPE = "TASK";

function getTaskCompletionPercent(
  task: Task,
  taskMap: Map<string, Task>,
): { completed: number; total: number } {
  const hasSubTasks = task.subTasks != null && task.subTasks.length > 0;
  const isArchived = task.isArchived ?? false;
  let completed = hasSubTasks
    ? 0
    : isCompleted(task, taskMap) === "completed"
      ? 1
      : 0;
  let total = hasSubTasks ? 0 : isArchived ? 0 : 1;
  for (const id of task.subTasks ?? []) {
    const child = taskMap.get(id);
    if (child) {
      const sub = getTaskCompletionPercent(child, taskMap);
      completed += hasSubTasks ? sub.completed : 0;
      total += sub.total;
    }
  }
  return { completed, total };
}

function sortChildTasks(
  subTaskIds: string[],
  taskMap: Map<string, Task>,
): Task[] {
  const tasks = subTaskIds
    .map((id) => taskMap.get(id))
    .filter((t): t is Task => t != null);
  const incomplete = tasks
    .filter((t) => !isCompleted(t, taskMap))
    .sort((a, b) => a.createdOn - b.createdOn);
  const complete = tasks
    .filter((t) => isCompleted(t, taskMap))
    .sort((a, b) => a.createdOn - b.createdOn);
  return [...incomplete, ...complete];
}

export interface TaskItemProps {
  task: Task;
  taskMap: Map<string, Task>;
  indentLevel?: number;
  onTaskComplete?: (taskId: string, isComplete: boolean, completeSubtasks?: boolean) => void;
  onAddTask?: (content: string, parentTaskId: string) => void;
  onEditTask?: (taskId: string, content: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onArchiveTask?: (taskId: string, archived: boolean) => void;
  onDrop?: (draggedTaskId: string, targetTaskId: string) => void;
  showArchived?: boolean;
  projectId?: string;
}

export default function TaskItem({
  task,
  taskMap,
  indentLevel = 0,
  onTaskComplete,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
  onDrop,
  showArchived = false,
  projectId,
}: TaskItemProps) {
  const addMode = useContext(TaskAddModeContext);
  const [isHovered, setIsHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isEditMode = addMode?.editTaskId === task.id;

  const [{ isDragging }, dragRef] = useDrag({
    type: TASK_TYPE,
    item: () => ({ taskId: task.id }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [{ isOver }, dropRef] = useDrop({
    accept: TASK_TYPE,
    drop: (item: { taskId: string }) => {
      onDrop?.(item.taskId, task.id);
    },
    canDrop: (item: { taskId: string }) => item.taskId !== task.id,
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  });

  const attachDragDropRef = (el: HTMLDivElement | null) => {
    dragRef(el);
    dropRef(el);
  };
  const subTaskIdsRaw = task.subTasks ?? [];
  const subTaskIds = showArchived
    ? subTaskIdsRaw
    : subTaskIdsRaw.filter((id) => !taskMap.get(id)?.isArchived);
  const hasSubTasks = subTaskIds.length > 0;
  const completedStatus = isCompleted(task, taskMap);
  const completed = completedStatus === "completed";
  const { completed: completedCount, total } = getTaskCompletionPercent(
    task,
    taskMap,
  );
  const percentText = hasSubTasks
    ? `${Math.round((completedCount / total) * 100)}% complete`
    : null;
  const sortedChildren = sortChildTasks(subTaskIds, taskMap);
  const archived = task.isArchived ?? false;
  const showAddIcon = isHovered && addMode?.setTaskAddMode && !isEditMode;
  const showDeleteButton = isHovered && !isEditMode && onDeleteTask;
  const showArchiveButton = isHovered && !isEditMode && onArchiveTask;

  return (
    <Box
      component={motion.div}
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      sx={{ mb: 0.5 }}
    >
      <Box
        ref={attachDragDropRef}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          pl: indentLevel * 3,
          border: "1px solid transparent",
          borderRadius: "4px",
          cursor: isDragging ? "grabbing" : "grab",
          ...(task.isArchived ? { opacity: 0.6 } : {}),
          ...(isDragging
            ? { backgroundColor: "var(--scratchpad-toolbar-bg)", opacity: 0.85 }
            : {}),
          ...(isOver
            ? {
                backgroundColor: "rgba(15, 166, 242, 0.18)",
                borderColor: "var(--projects-metric-color)",
              }
            : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Checkbox
          size="small"
          checked={archived ? false : completed}
          disabled={archived}
          icon={
            archived ? (
              <IndeterminateCheckBoxIcon
                sx={{ color: "var(--tasks-archived-color)" }}
              />
            ) : (
              <CheckBoxOutlineBlankIcon
                sx={{ color: "var(--scratchpad-text-muted)" }}
              />
            )
          }
          onChange={
            archived
              ? undefined
              : () =>
                  onTaskComplete?.(
                    task.id,
                    !completed,
                    !!hasSubTasks,
                  )
          }
          checkedIcon={
            <CheckBoxIcon sx={{ color: "var(--tasks-complete-color)" }} />
          }
          sx={{ p: 0.25, alignSelf: "center" }}
        />
        <Box
          sx={{
            minWidth: 0,
            ...(isEditMode ? { width: "70%" } : {}),
            ...(onEditTask && !isEditMode ? { cursor: "pointer" } : {}),
          }}
          onClick={
            onEditTask && !isEditMode
              ? (e) => {
                  e.stopPropagation();
                  addMode?.setEditTaskId(task.id);
                }
              : undefined
          }
        >
          {isEditMode && onEditTask ? (
            <AddTaskInput
              initialValue={task.content}
              mode="edit"
              inline
              variant="projects"
              onSubmit={(content) => {
                onEditTask(task.id, content);
                addMode?.setEditTaskId(undefined);
              }}
              onCancel={() => addMode?.setEditTaskId(undefined)}
            />
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  color: isHovered
                    ? "var(--projects-metric-color)"
                    : completed
                      ? "var(--scratchpad-text-muted)"
                      : "var(--scratchpad-text)",
                  textDecoration: completed ? "line-through" : "none",
                }}
              >
                {task.content}
              </Typography>
              {percentText != null && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "var(--scratchpad-text-muted)",
                    display: "block",
                    mt: 0.25,
                  }}
                >
                  {percentText}
                </Typography>
              )}
            </>
          )}
        </Box>
        <Stack ml={1.5} direction="row" gap={1} sx={{ alignItems: "center" }}>
          {showAddIcon && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addMode?.setTaskAddMode(task.id);
              }}
              sx={{
                color: "#ffffff",
                p: 0.25,
                mt: 0.25,
                bgcolor: "var(--projects-metric-color)",
                "&:hover": {
                  bgcolor: "var(--projects-metric-color)",
                },
                borderRadius: "4px",
              }}
              aria-label="Add subtask"
            >
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          {showArchiveButton && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onArchiveTask?.(task.id, !(task.isArchived ?? false));
                if (addMode?.editTaskId === task.id)
                  addMode.setEditTaskId(undefined);
                if (addMode?.taskAddMode === task.id)
                  addMode.setTaskAddMode(undefined);
              }}
              sx={{
                color: "#ffffff",
                p: 0.25,
                mt: 0.25,
                bgcolor: "var(--projects-metric-color)",
                "&:hover": {
                  bgcolor: "var(--projects-metric-color)",
                },
                borderRadius: "4px",
              }}
              aria-label={task.isArchived ? "Unarchive task" : "Archive task"}
            >
              {task.isArchived ? (
                <Unarchive sx={{ fontSize: 18 }} />
              ) : (
                <Archive sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          )}
          {showDeleteButton && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              sx={{
                color: "#ffffff",
                p: 0.25,
                mt: 0.25,
                bgcolor: "#E67373",
                "&:hover": {
                  bgcolor: "#E67373",
                },
                borderRadius: "4px",
              }}
              aria-label="Delete task"
            >
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Stack>
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-task-dialog-title"
        aria-describedby="delete-task-dialog-description"
      >
        <DialogTitle id="delete-task-dialog-title">Delete task?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-task-dialog-description">
            Are you sure you want to delete this task? This will also remove all
            subtasks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onDeleteTask?.(task.id);
              setDeleteDialogOpen(false);
            }}
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {sortedChildren.map((childTask) => (
        <TaskItem
          key={childTask.id}
          task={childTask}
          taskMap={taskMap}
          indentLevel={indentLevel + 1}
          onTaskComplete={onTaskComplete}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onArchiveTask={onArchiveTask}
          onDrop={onDrop}
          showArchived={showArchived}
          projectId={projectId}
        />
      ))}
      {addMode?.taskAddMode === task.id && onAddTask && !isEditMode && (
        <AddTaskInput
          indentLevel={indentLevel + 1}
          onSubmit={(content) => {
            onAddTask(content, task.id);
            addMode.setTaskAddMode(undefined);
          }}
          onCancel={() => addMode.setTaskAddMode(undefined)}
        />
      )}
    </Box>
  );
}

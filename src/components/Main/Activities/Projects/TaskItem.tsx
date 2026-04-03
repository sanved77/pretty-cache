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
  Typography,
} from "@mui/material";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import type { Task } from "../../../../types/projects";
import { isCompleted } from "../../../../utils/taskCompletion";
import { useSnackbarContext } from "../../../../contexts/useSnackbarContext";
import { useTaskActions } from "./useTaskActions";
import { TaskAddModeContext } from "./TaskAddModeContext";
import AddTaskInput from "./AddTaskInput";
import TaskItemActions from "./TaskItemActions";
import TaskItemContextMenu from "./TaskItemContextMenu";

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
    .filter((t) => isCompleted(t, taskMap) === 'incomplete')
    .sort((a, b) => a.createdOn - b.createdOn);
  const complete = tasks
    .filter((t) => isCompleted(t, taskMap) !== 'incomplete')
    .sort((a, b) => a.createdOn - b.createdOn);
  return [...incomplete, ...complete];
}

export interface TaskItemProps {
  task: Task;
  taskMap: Map<string, Task>;
  indentLevel?: number;
  onDrop?: (draggedTaskId: string, targetTaskId: string) => void;
  showArchived?: boolean;
  projectId?: string;
}

export default function TaskItem({
  task,
  taskMap,
  indentLevel = 0,
  onDrop,
  showArchived = false,
  projectId,
}: TaskItemProps) {
  const addMode = useContext(TaskAddModeContext);
  const {
    setTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    archiveTask,
    duplicateTask,
    isTaskTracked,
    toggleTrackedTask,
  } = useTaskActions();
  const { showSnackbar } = useSnackbarContext();
  const [isHovered, setIsHovered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
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
  const percent =
    total > 0 ? (completedCount / total) * 100 : null;
  const percentText = hasSubTasks
    ? percent
      ? `${Math.round(percent)}% complete`
      : null
    : null;
  const sortedChildren = sortChildTasks(subTaskIds, taskMap);
  const archived = task.isArchived ?? false;
  const showAddIcon = isHovered && addMode?.setTaskAddMode && !isEditMode;
  const showArchiveButton = isHovered && !isEditMode;
  const showTrackButton = isHovered && !isEditMode;
  const tracked = isTaskTracked(task.id);
  const showTrackedTitleStyle =
    tracked && !completed && !archived;

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
                backgroundColor: "var(--tasks-highlight-bg)",
                borderColor: "var(--projects-metric-color)",
              }
            : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({
            mouseX: e.clientX + 2,
            mouseY: e.clientY - 6,
          });
        }}
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
                  setTaskComplete(
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
            ...(!isEditMode ? { cursor: "pointer" } : {}),
          }}
          onClick={
            !isEditMode
              ? (e) => {
                  e.stopPropagation();
                  addMode?.setEditTaskId(task.id);
                }
              : undefined
          }
        >
          {isEditMode ? (
            <AddTaskInput
              initialValue={task.content}
              mode="edit"
              inline
              variant="projects"
              onSubmit={(content) => {
                updateTask(task.id, content);
                addMode?.setEditTaskId(undefined);
                showSnackbar("info", "Task updated");
              }}
              onCancel={() => addMode?.setEditTaskId(undefined)}
            />
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: showTrackedTitleStyle ? 600 : undefined,
                  color: completed
                    ? "var(--scratchpad-text-muted)"
                    : showTrackedTitleStyle
                      ? "var(--tasks-complete-color)"
                      : isHovered
                        ? "var(--projects-metric-color)"
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
        <TaskItemActions
          task={task}
          showAddIcon={!!showAddIcon}
          showTrackButton={!!showTrackButton}
          isTracked={tracked}
          showArchiveButton={!!showArchiveButton}
          onAddClick={(taskId) => addMode?.setTaskAddMode(taskId)}
          onToggleTracked={(taskId) => toggleTrackedTask(taskId)}
          onArchiveClick={() => {
            archiveTask(task.id, !(task.isArchived ?? false));
            if (addMode?.editTaskId === task.id)
              addMode.setEditTaskId(undefined);
            if (addMode?.taskAddMode === task.id)
              addMode.setTaskAddMode(undefined);
          }}
        />
      </Box>
      <TaskItemContextMenu
        open={contextMenu !== null}
        contextMenu={contextMenu}
        task={task}
        onClose={() => setContextMenu(null)}
        onAddSubtask={() => addMode?.setTaskAddMode(task.id)}
        onToggleArchive={() => {
          archiveTask(task.id, !(task.isArchived ?? false));
          if (addMode?.editTaskId === task.id)
            addMode.setEditTaskId(undefined);
          if (addMode?.taskAddMode === task.id)
            addMode.setTaskAddMode(undefined);
        }}
        onDelete={() => setDeleteDialogOpen(true)}
        onDuplicate={(taskId) => {
          duplicateTask(taskId);
          showSnackbar("success", "Task duplicated");
        }}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDeleteDialogOpen(false);
          }
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            deleteTask(task.id);
            setDeleteDialogOpen(false);
            showSnackbar("info", "Task deleted");
          }
        }}
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
              deleteTask(task.id);
              setDeleteDialogOpen(false);
              showSnackbar("info", "Task deleted");
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
          onDrop={onDrop}
          showArchived={showArchived}
          projectId={projectId}
        />
      ))}
      {addMode?.taskAddMode === task.id && projectId && !isEditMode && (
        <AddTaskInput
          indentLevel={indentLevel + 1}
          onSubmit={(content) => {
            addTask({ content, parentTaskId: task.id, projectId });
            addMode.setTaskAddMode(undefined);
            showSnackbar("success", "Subtask added");
          }}
          onCancel={() => addMode.setTaskAddMode(undefined)}
        />
      )}
    </Box>
  );
}

import { useMemo, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { Task } from "../../../../types/projects";
import { isCompleted } from "../../../../utils/taskCompletion";
import {
  getProjectCompletion,
  getProjectTaskIds,
} from "../../../../utils/projectCompletion";
import { useSnackbarContext } from "../../../../contexts/useSnackbarContext";
import { useTaskActions } from "./useTaskActions";
import { TaskAddModeContext } from "./TaskAddModeContext";
import AddTaskInput from "./AddTaskInput";
import TaskItem, { TASK_TYPE } from "./TaskItem";

function getRootTasks(tasks: Task[], projectId: string): Task[] {
  const projectIds = getProjectTaskIds(tasks, projectId);
  const filtered = tasks.filter((t) => projectIds.has(t.id));
  const childIds = new Set<string>();
  for (const t of filtered) {
    for (const id of t.subTasks ?? []) childIds.add(id);
  }
  return filtered.filter((t) => !childIds.has(t.id));
}

function sortTasksIncompleteFirst(
  tasks: Task[],
  taskMap: Map<string, Task>,
): Task[] {
  const incomplete = tasks
    .filter((t) => isCompleted(t, taskMap) === "incomplete")
    .sort((a, b) => a.createdOn - b.createdOn);
  const complete = tasks
    .filter((t) => isCompleted(t, taskMap) !== "incomplete")
    .sort((a, b) => a.createdOn - b.createdOn);
  return [...incomplete, ...complete];
}

export interface TasksPanelProps {
  tasks: Task[];
  projectId: string;
}

type PendingMove = { draggedId: string; targetId: string | null } | null;

function RootDropZone({
  onDropToRoot,
}: {
  onDropToRoot: (draggedId: string) => void;
}) {
  const [{ isOver }, dropRef] = useDrop({
    accept: TASK_TYPE,
    drop: (item: { taskId: string }) => {
      onDropToRoot(item.taskId);
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  });
  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 48,
        padding: "8px 16px",
        borderRadius: 4,
        border: isOver
          ? "1px dashed var(--projects-metric-color)"
          : "1px dashed transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxSizing: "border-box",
        ...(isOver
          ? {
              backgroundColor: "var(--tasks-highlight-bg)",
            }
          : {
              backgroundColor: "transparent",
            }),
      }}
    >
      {isOver && (
        <Typography
          variant="caption"
          sx={{ color: "var(--scratchpad-text-muted)" }}
        >
          Drop here for top level
        </Typography>
      )}
    </div>
  );
}

export default function TasksPanel({ tasks, projectId }: TasksPanelProps) {
  const { addTask, moveTask } = useTaskActions();
  const { showSnackbar } = useSnackbarContext();
  const [taskAddMode, setTaskAddMode] = useState<string | "root" | undefined>(
    undefined,
  );
  const [editTaskId, setEditTaskId] = useState<string | undefined>(undefined);
  const [pendingMove, setPendingMove] = useState<PendingMove>(null);
  const [showArchived, setShowArchived] = useState(false);
  const nonArchivedTasks = useMemo(
    () => tasks.filter((t) => !t.isArchived),
    [tasks],
  );
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const tasksForDisplay = showArchived ? tasks : nonArchivedTasks;
  const rootTasks = useMemo(
    () => getRootTasks(tasksForDisplay, projectId),
    [tasksForDisplay, projectId],
  );
  const sortedRoots = useMemo(
    () => sortTasksIncompleteFirst(rootTasks, taskMap),
    [rootTasks, taskMap],
  );
  const { completed, total } = useMemo(
    () => getProjectCompletion(nonArchivedTasks, projectId, taskMap),
    [nonArchivedTasks, projectId, taskMap],
  );
  const activeCount = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddRootTask = (content: string) => {
    addTask({ content, projectId });
    showSnackbar("success", "Task added");
  };

  const handleDrop = (draggedId: string, targetId: string | null) => {
    if (targetId === null) {
      setPendingMove({ draggedId, targetId: null });
    } else if (draggedId !== targetId) {
      setPendingMove({ draggedId, targetId });
    }
  };

  const handleConfirmMove = () => {
    if (pendingMove) {
      moveTask(pendingMove.draggedId, pendingMove.targetId);
      setPendingMove(null);
    }
  };

  const draggedTask = pendingMove
    ? taskMap.get(pendingMove.draggedId)
    : undefined;
  const targetTask =
    pendingMove && pendingMove.targetId != null
      ? taskMap.get(pendingMove.targetId)
      : undefined;

  return (
    <TaskAddModeContext.Provider
      value={{ taskAddMode, setTaskAddMode, editTaskId, setEditTaskId }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "overflow-y",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setTaskAddMode(undefined);
          setEditTaskId(undefined);
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 900,
              letterSpacing: "-0.05em",
              textTransform: "uppercase",
              color: "var(--color-on-accent)",
            }}
          >
            Tasks
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`${activeCount} Active`}
              size="small"
              sx={{
                bgcolor: "var(--scratchpad-toolbar-bg)",
                color: "var(--projects-metric-color)",
                border: "1px solid var(--projects-metric-color)",
                borderRadius: "16px",
              }}
            />
            <Chip
              label={`${completed} Completed`}
              size="small"
              sx={{
                bgcolor: "var(--scratchpad-toolbar-bg)",
                color: "var(--projects-inactive-text)",
                border: "1px solid var(--projects-inactive)",
                borderRadius: "16px",
              }}
            />
            <Button
              size="small"
              onClick={() => setShowArchived((v) => !v)}
              startIcon={
                showArchived ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )
              }
              sx={{
                color: "var(--scratchpad-text-muted)",
                textTransform: "none",
              }}
              aria-label={
                showArchived ? "Hide archived tasks" : "Show archived tasks"
              }
            >
              Archive
            </Button>
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "var(--projects-metric-color)", mb: 2 }}
        >
          {percent}% complete
        </Typography>
        <Box sx={{ display: "flex", width: "70%", mb: 2 }}>
          <AddTaskInput
            onSubmit={handleAddRootTask}
            centerRow
            fillContainer
            placeholder="New task…"
          />
        </Box>
        <DndProvider backend={HTML5Backend}>
          <Box
            sx={{
              flex: 1,
              gap: 2,
              p: 2,
              borderRadius: 2,
              minHeight: 0,
              bgcolor: "var(--tasks-panel-bg)",
            }}
          >
            <Box
              sx={{
                height: "100%",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={() => {
                setEditTaskId(undefined);
                setTaskAddMode(undefined);
              }}
            >
              {sortedRoots.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  taskMap={taskMap}
                  onDrop={handleDrop}
                  showArchived={showArchived}
                  projectId={projectId}
                />
              ))}
              <Box
                sx={{
                  flex: "1 0 auto",
                  minHeight: 48,
                  width: "100%",
                  display: "flex",
                }}
              >
                <RootDropZone
                  onDropToRoot={(draggedId) => handleDrop(draggedId, null)}
                />
              </Box>
            </Box>
          </Box>
        </DndProvider>
      </Box>
      <Dialog
        open={pendingMove != null}
        onClose={() => setPendingMove(null)}
        aria-labelledby="move-task-dialog-title"
        aria-describedby="move-task-dialog-description"
      >
        <DialogTitle id="move-task-dialog-title">
          {pendingMove?.targetId == null
            ? "Move task to top level?"
            : "Move task as subtask?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="move-task-dialog-description">
            {pendingMove?.targetId == null
              ? draggedTask
                ? `Move "${draggedTask.content}" to top level? This will make it a top-level task.`
                : "Move this task to top level?"
              : draggedTask && targetTask
                ? `Move "${draggedTask.content}" to become a subtask of "${targetTask.content}"?`
                : "Move this task as a subtask of the target task?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingMove(null)}>Cancel</Button>
          <Button onClick={handleConfirmMove} color="primary" autoFocus>
            Move
          </Button>
        </DialogActions>
      </Dialog>
    </TaskAddModeContext.Provider>
  );
}

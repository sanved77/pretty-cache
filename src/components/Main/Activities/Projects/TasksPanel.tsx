import { useMemo, useState } from "react";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import type { Task } from "../../../../types/projects";
import { isCompleted } from "../../../../utils/taskCompletion";
import { TaskAddModeContext } from "./TaskAddModeContext";
import AddTaskInput from "./AddTaskInput";
import TaskItem from "./TaskItem";

function getProjectTaskIds(tasks: Task[], projectId: string): Set<string> {
  const byProject = tasks.filter((t) => t.projectID === projectId);
  const ids = new Set<string>();
  function add(task: Task) {
    ids.add(task.id);
    for (const id of task.subTasks ?? []) {
      const child =
        byProject.find((t) => t.id === id) ?? tasks.find((t) => t.id === id);
      if (child) add(child);
    }
  }
  byProject.forEach(add);
  return ids;
}

function getProjectCompletion(
  tasks: Task[],
  projectId: string,
  taskMap: Map<string, Task>,
): { completed: number; total: number } {
  const ids = getProjectTaskIds(tasks, projectId);
  let completed = 0;
  // eslint-disable-next-line prefer-const -- keep let for future dynamic updates
  let total = ids.size;
  for (const id of ids) {
    const t = taskMap.get(id);
    if (t && isCompleted(t, taskMap)) completed++;
  }
  return { completed, total };
}

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
    .filter((t) => !isCompleted(t, taskMap))
    .sort((a, b) => a.createdOn - b.createdOn);
  const complete = tasks
    .filter((t) => isCompleted(t, taskMap))
    .sort((a, b) => a.createdOn - b.createdOn);
  return [...incomplete, ...complete];
}

export interface TasksPanelProps {
  tasks: Task[];
  projectId: string;
  onTaskComplete?: (taskId: string, isComplete: boolean) => void;
  addTask?: (params: {
    content: string;
    parentTaskId?: string;
    projectId: string;
  }) => void;
  updateTask?: (taskId: string, content: string) => void;
}

export default function TasksPanel({
  tasks,
  projectId,
  onTaskComplete,
  addTask,
  updateTask,
}: TasksPanelProps) {
  const [taskAddMode, setTaskAddMode] = useState<string | "root" | undefined>(
    undefined,
  );
  const [editTaskId, setEditTaskId] = useState<string | undefined>(undefined);
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const rootTasks = useMemo(
    () => getRootTasks(tasks, projectId),
    [tasks, projectId],
  );
  const sortedRoots = useMemo(
    () => sortTasksIncompleteFirst(rootTasks, taskMap),
    [rootTasks, taskMap],
  );
  const { completed, total } = useMemo(
    () => getProjectCompletion(tasks, projectId, taskMap),
    [tasks, projectId, taskMap],
  );
  const activeCount = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddTask = (content: string, parentTaskId?: string) => {
    addTask?.({ content, parentTaskId, projectId });
    setTaskAddMode(undefined);
  };

  const handleEditTask = (taskId: string, content: string) => {
    updateTask?.(taskId, content);
  };

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
            variant="h6"
            sx={{ color: "var(--scratchpad-text)", fontWeight: 600 }}
          >
            Tasks
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
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
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "var(--projects-metric-color)", mb: 2 }}
        >
          {percent}% complete
        </Typography>
        <Box
          sx={{ flex: 1, overflow: "auto" }}
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
              onTaskComplete={onTaskComplete}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              projectId={projectId}
            />
          ))}
          {taskAddMode === "root" ? (
            <AddTaskInput
              onSubmit={(content) => handleAddTask(content)}
              onCancel={() => setTaskAddMode(undefined)}
              centerRow
            />
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTaskId(undefined);
                  setTaskAddMode("root");
                }}
                sx={{ color: "var(--scratchpad-text-muted)" }}
                aria-label="Add root task"
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </TaskAddModeContext.Provider>
  );
}

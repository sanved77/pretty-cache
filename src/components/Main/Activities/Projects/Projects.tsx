import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Check from "@mui/icons-material/Check";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import Clear from "@mui/icons-material/Clear";
import { useTasks } from "../../../../hooks/useTasks";
import { useProjects } from "../../../../hooks/useProjects";
import { useSnackbarContext } from "../../../../contexts/useSnackbarContext";
import { TaskActionsProvider } from "./TaskActionsProvider";
import TasksPanel from "./TasksPanel";
import BlockersSection from "./BlockersSection";
import QuestionsSection from "./QuestionsSection";
import LinksSection from "./LinksSection";
import type { ProjectStatus } from "../../../../types/projects";
import { getDisplayStatus } from "./projectStatusDisplay";
import { formatProjectDeadlineRemaining } from "../../../../utils/projectDeadlineRemaining";
import { endOfDay } from "../../../../utils/dateRangeFilter";
import { openLink } from "../../../../utils/openLink";

function deadlineMsToDateInputValue(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const deadlineFieldSx = {
  minWidth: 168,
  "& .MuiOutlinedInput-root": {
    bgcolor: "var(--tasks-panel-bg)",
    color: "var(--scratchpad-text)",
    "& fieldset": { borderColor: "var(--scratchpad-separator)" },
    "&:hover fieldset": { borderColor: "var(--projects-metric-color)" },
    "&.Mui-focused fieldset": { borderColor: "var(--projects-metric-color)" },
  },
  "& .MuiInputLabel-root": {
    color: "var(--scratchpad-text-muted)",
    "&.Mui-focused": { color: "var(--projects-metric-color)" },
  },
} as const;

export default function Projects() {
  const {
    tasks,
    setTaskComplete,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveTask,
    duplicateTask,
    isTaskTracked,
    toggleTrackedTask,
  } = useTasks();
  const {
    projects,
    setBlockerDismissed,
    addBlocker,
    addQuestion,
    addLink,
    updateLink,
    incrementLinkVisits,
    deleteLink,
    isLinkTracked,
    toggleTrackedLink,
    updateProjectName,
    updateProjectDescription,
    updateProjectStatus,
    updateProjectDeadline,
  } = useProjects();
  const { showSnackbar } = useSnackbarContext();
  const { projectId } = useParams<{ projectId: string }>();
  const selectedProjectId = projectId ?? "";
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );
  const deadlineCountdownLabel =
    selectedProject?.deadlineOn != null
      ? formatProjectDeadlineRemaining(selectedProject.deadlineOn)
      : null;
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  const taskActionsValue = useMemo(
    () => ({
      setTaskComplete,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      archiveTask,
      duplicateTask,
      isTaskTracked,
      toggleTrackedTask,
    }),
    [
      setTaskComplete,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      archiveTask,
      duplicateTask,
      isTaskTracked,
      toggleTrackedTask,
    ],
  );

  const cancelEdit = () => {
    setEditingField(null);
    setErrorText(null);
  };

  const saveName = () => {
    const value = (nameRef.current?.value ?? "").trim();
    if (value.length === 0)
      return setErrorText("Project name cannot be empty.");
    if (value.length > 140)
      return setErrorText("Project name must be 140 characters or less.");
    updateProjectName(selectedProjectId, value);
    cancelEdit();
  };

  const saveDescription = () => {
    const value = descRef.current?.value ?? "";
    if (value.length > 1000)
      return setErrorText("Description must be 1000 characters or less.");
    updateProjectDescription(selectedProjectId, value);
    cancelEdit();
  };

  if (selectedProjectId && !selectedProject) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "var(--projects-bg)",
          color: "var(--scratchpad-text)",
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Link
          to="/projects"
          style={{ color: "var(--projects-metric-color)" }}
        >
          Back to Projects
        </Link>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        backgroundColor: "var(--projects-bg)",
        color: "var(--scratchpad-text)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flex: "1 1 60%",
          minWidth: 0,
          overflow: "hidden",
          p: 2,
          // borderRight: "1px solid var(--scratchpad-separator)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedProject ? (
          <>
            <Box
              onMouseEnter={() => setIsHeaderHovered(true)}
              onMouseLeave={() => setIsHeaderHovered(false)}
              sx={{ mb: 2 }}
            >
              {editingField === "name" ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <TextField
                    inputRef={nameRef}
                    defaultValue={selectedProject.projectName}
                    variant="standard"
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveName();
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "2.125rem",
                        fontWeight: 700,
                        color: "var(--scratchpad-text)",
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={saveName}
                    sx={{ color: "var(--scratchpad-text-muted)" }}
                    aria-label="Save project name"
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ color: "var(--scratchpad-text)", fontWeight: 700 }}
                  >
                    {selectedProject.projectName}
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingField("name");
                        setErrorText(null);
                      }}
                      sx={{
                        color: "var(--scratchpad-text-muted)",
                        visibility: isHeaderHovered ? "visible" : "hidden",
                        pointerEvents: isHeaderHovered ? "auto" : "none",
                      }}
                      aria-label="Edit project name"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {editingField === "description" ? (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <TextField
                    inputRef={descRef}
                    defaultValue={selectedProject.description}
                    variant="standard"
                    fullWidth
                    multiline
                    minRows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        saveDescription();
                      }
                      if (e.key === "Escape") cancelEdit();
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.875rem",
                        color: "var(--scratchpad-text-muted)",
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={saveDescription}
                    sx={{ color: "var(--scratchpad-text-muted)", mt: 0.5 }}
                    aria-label="Save project description"
                  >
                    <Check fontSize="small" />
                  </IconButton>
                </Box>
              ) : selectedProject.description.trim().length > 0 ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--scratchpad-text-muted)" }}
                  >
                    {selectedProject.description}
                  </Typography>
                  <Box
                    sx={{
                      width: 32,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingField("description");
                        setErrorText(null);
                      }}
                      sx={{
                        color: "var(--scratchpad-text-muted)",
                        visibility: isHeaderHovered ? "visible" : "hidden",
                        pointerEvents: isHeaderHovered ? "auto" : "none",
                      }}
                      aria-label="Edit project description"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--scratchpad-text-muted)",
                    fontStyle: "italic",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setEditingField("description");
                    setErrorText(null);
                  }}
                >
                  Add description
                </Typography>
              )}

              {errorText ? (
                <Typography
                  variant="caption"
                  sx={{ color: "var(--projects-error-color)", display: "block", mt: 0.5 }}
                >
                  {errorText}
                </Typography>
              ) : null}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 2,
                  mt: 1.5,
                }}
              >
                <FormControl
                  size="small"
                  sx={{
                    minWidth: 180,
                    "& .MuiInputLabel-root": {
                      color: "var(--scratchpad-text-muted)",
                      "&.Mui-focused": { color: "var(--projects-metric-color)" },
                    },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "var(--tasks-panel-bg)",
                      color: "var(--scratchpad-text)",
                      "& fieldset": { borderColor: "var(--scratchpad-separator)" },
                      "&:hover fieldset": { borderColor: "var(--projects-metric-color)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--projects-metric-color)" },
                    },
                    "& .MuiSvgIcon-root": { color: "var(--scratchpad-text-muted)" },
                  }}
                >
                  <InputLabel id="project-status-label">Status</InputLabel>
                  <Select<ProjectStatus>
                    labelId="project-status-label"
                    label="Status"
                    value={getDisplayStatus(selectedProject.status)}
                    onChange={(e) =>
                      updateProjectStatus(
                        selectedProjectId,
                        e.target.value as ProjectStatus,
                      )
                    }
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "var(--tasks-panel-bg)",
                          color: "var(--scratchpad-text)",
                          border: "1px solid var(--scratchpad-separator)",
                          "& .MuiMenuItem-root:hover": {
                            bgcolor: "var(--tasks-highlight-bg)",
                          },
                          "& .MuiMenuItem-root.Mui-selected": {
                            bgcolor: "rgba(15, 166, 242, 0.15)",
                          },
                          "& .MuiMenuItem-root.Mui-selected:hover": {
                            bgcolor: "var(--tasks-highlight-bg)",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Close">Close</MenuItem>
                    <MenuItem value="Paused">Paused</MenuItem>
                    <MenuItem value="Blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>

                {selectedProject.deadlineOn == null || editingDeadline ? (
                  <TextField
                    label="Deadline"
                    type="date"
                    size="small"
                    value={
                      selectedProject.deadlineOn != null
                        ? deadlineMsToDateInputValue(selectedProject.deadlineOn)
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      const parts = v.split("-").map(Number);
                      const y = parts[0];
                      const mo = parts[1];
                      const d = parts[2];
                      if (y == null || mo == null || d == null) return;
                      updateProjectDeadline(
                        selectedProjectId,
                        endOfDay(new Date(y, mo - 1, d)).getTime(),
                      );
                      setEditingDeadline(false);
                    }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={deadlineFieldSx}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          deadlineCountdownLabel === "Overdue"
                            ? "var(--projects-error-color)"
                            : "var(--projects-metric-color)",
                        fontWeight: 600,
                      }}
                    >
                      {deadlineCountdownLabel}
                    </Typography>
                    <Tooltip title="Change deadline">
                      <IconButton
                        size="small"
                        onClick={() => setEditingDeadline(true)}
                        sx={{ color: "var(--scratchpad-text-muted)" }}
                        aria-label="Change deadline"
                      >
                        <CalendarMonth fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear deadline">
                      <IconButton
                        size="small"
                        onClick={() => {
                          updateProjectDeadline(selectedProjectId, undefined);
                          setEditingDeadline(false);
                        }}
                        sx={{ color: "var(--scratchpad-text-muted)" }}
                        aria-label="Clear deadline"
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        ) : null}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TaskActionsProvider value={taskActionsValue}>
            <TasksPanel tasks={tasks} projectId={selectedProjectId} />
          </TaskActionsProvider>
        </Box>
      </Box>
      <Box sx={{ flex: "0 0 40%", minWidth: 0, overflow: "auto", p: 2 }}>
        {selectedProject ? (
          <>
            <LinksSection
              links={selectedProject.links}
              onAddLink={(link) => {
                addLink(selectedProjectId, link);
                showSnackbar("success", "Link added");
              }}
              onEditLink={(id, update) => {
                updateLink(selectedProjectId, id, update);
                showSnackbar("success", "Link updated");
              }}
              onDeleteLink={(id) => {
                deleteLink(selectedProjectId, id);
                showSnackbar("success", "Link deleted");
              }}
              isLinkTracked={isLinkTracked}
              onToggleLinkTracked={toggleTrackedLink}
              onLinkClick={(id, url) => openLink(id, url, incrementLinkVisits)}
            />
            <BlockersSection
              blockers={selectedProject.blockers}
              onDismissBlocker={(i) =>
                setBlockerDismissed(selectedProjectId, i)
              }
              onAddBlocker={(text) => {
                addBlocker(selectedProjectId, text);
                showSnackbar("success", "Blocker added");
              }}
            />
            <QuestionsSection
              questions={selectedProject.questions}
              onAddQuestion={(text) => {
                addQuestion(selectedProjectId, text);
                showSnackbar("success", "Question added");
              }}
            />
          </>
        ) : null}
      </Box>
    </Box>
  );
}

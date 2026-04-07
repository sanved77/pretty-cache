import { useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import PushPin from "@mui/icons-material/PushPin";
import { useTasks } from "../../../../hooks/useTasks";
import { useProjects } from "../../../../hooks/useProjects";
import { useBlockers } from "../../../../hooks/useBlockers";
import { useQuestions } from "../../../../hooks/useQuestions";
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
    removeTasksForProject,
    moveTask,
    archiveTask,
    duplicateTask,
    isTaskTracked,
    toggleTrackedTask,
  } = useTasks();
  const {
    projects,
    addBlockerIdToProject,
    addQuestionIdToProject,
    addLink,
    updateLink,
    incrementLinkVisits,
    deleteLink,
    isLinkTracked,
    toggleTrackedLink,
    toggleTrackedProject,
    isProjectTracked,
    updateProjectName,
    updateProjectDescription,
    updateProjectStatus,
    updateProjectDeadline,
    deleteProject,
  } = useProjects();
  const {
    getBlockersForProject,
    addBlocker,
    dismissBlocker,
    undismissBlocker,
    removeBlockersForProject,
  } = useBlockers();
  const {
    getQuestionsForProject,
    addQuestion,
    resolveQuestion,
    unresolveQuestion,
    removeQuestionsForProject,
  } = useQuestions();
  const { showSnackbar } = useSnackbarContext();
  const navigate = useNavigate();
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
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  const deleteProjectWithCascade = useCallback(
    (id: string) => {
      removeTasksForProject(id);
      removeBlockersForProject(id);
      removeQuestionsForProject(id);
      deleteProject(id);
    },
    [
      removeTasksForProject,
      removeBlockersForProject,
      removeQuestionsForProject,
      deleteProject,
    ],
  );

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
          p: 3,
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ maxWidth: 420, textAlign: "center" }}>
          <Typography
            component="p"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--scratchpad-text-muted)",
              mb: 1,
            }}
          >
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
            Project not found
          </Typography>
          <Typography
            sx={{
              color: "var(--scratchpad-text-muted)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              mb: 3,
            }}
          >
            Nothing is saved under this ID in this browser. The link may be wrong, or the
            project may have been deleted.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/projects"
            sx={{
              bgcolor: "var(--projects-metric-color)",
              "&:hover": { bgcolor: "var(--projects-metric-color)", opacity: 0.92 },
            }}
          >
            Back to all projects
          </Button>
        </Box>
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
                  <Tooltip
                    title={
                      isProjectTracked(selectedProjectId)
                        ? "Untrack project"
                        : "Track project"
                    }
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        const wasTracked = isProjectTracked(selectedProjectId);
                        toggleTrackedProject(selectedProjectId);
                        showSnackbar(
                          "success",
                          wasTracked ? "Project untracked" : "Project tracked",
                        );
                      }}
                      sx={{
                        color: isProjectTracked(selectedProjectId)
                          ? "var(--projects-metric-color)"
                          : "var(--scratchpad-text-muted)",
                        visibility: isHeaderHovered || isProjectTracked(selectedProjectId)
                          ? "visible"
                          : "hidden",
                      }}
                      aria-label="Toggle track project"
                    >
                      <PushPin
                        sx={{
                          fontSize: 20,
                          transform: isProjectTracked(selectedProjectId)
                            ? "none"
                            : "rotate(45deg)",
                          transition: "transform 0.15s",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
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

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setDeleteProjectDialogOpen(true)}
                  sx={{
                    color: "var(--scratchpad-text-muted)",
                    fontSize: "0.75rem",
                    textTransform: "none",
                    minWidth: 0,
                    opacity: 0.8,
                    fontWeight: 400,
                    "&:hover": {
                      opacity: 1,
                      color: "var(--projects-error-color)",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  Delete project
                </Button>
              </Box>
            </Box>
          </>
        ) : null}

        <Dialog
          open={deleteProjectDialogOpen}
          onClose={() => setDeleteProjectDialogOpen(false)}
          aria-labelledby="project-page-delete-dialog-title"
          aria-describedby="project-page-delete-dialog-description"
        >
          <DialogTitle id="project-page-delete-dialog-title">
            Delete project?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="project-page-delete-dialog-description">
              {selectedProject
                ? `"${selectedProject.projectName}" will be removed. All tasks, blockers, questions, and links for this project will be deleted. This cannot be undone.`
                : ""}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => {
                if (selectedProjectId) {
                  deleteProjectWithCascade(selectedProjectId);
                  showSnackbar("success", "Project deleted");
                  setDeleteProjectDialogOpen(false);
                  navigate("/projects");
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

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
              blockers={getBlockersForProject(selectedProjectId)}
              onDismissBlocker={(blockerId) => dismissBlocker(blockerId)}
              onUndismissBlocker={(blockerId) => {
                undismissBlocker(blockerId);
                showSnackbar("success", "Blocker restored");
              }}
              onAddBlocker={(text) => {
                const id = addBlocker(selectedProjectId, text);
                addBlockerIdToProject(selectedProjectId, id);
                showSnackbar("success", "Blocker added");
              }}
            />
            <QuestionsSection
              questions={getQuestionsForProject(selectedProjectId)}
              onAddQuestion={(text) => {
                const id = addQuestion(selectedProjectId, text);
                addQuestionIdToProject(selectedProjectId, id);
                showSnackbar("success", "Question added");
              }}
              onToggleResolved={(questionId) => {
                const q = getQuestionsForProject(selectedProjectId).find((x) => x.id === questionId);
                if (q?.resolvedOn != null) {
                  unresolveQuestion(questionId);
                } else {
                  resolveQuestion(questionId);
                }
              }}
            />
          </>
        ) : null}
      </Box>
    </Box>
  );
}

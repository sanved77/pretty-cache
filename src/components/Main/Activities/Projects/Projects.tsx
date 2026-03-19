import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Check from "@mui/icons-material/Check";
import { useTasks } from "../../../../hooks/useTasks";
import { useProjects } from "../../../../hooks/useProjects";
import { useSnackbarContext } from "../../../../contexts/useSnackbarContext";
import { TaskActionsProvider } from "./TaskActionsProvider";
import TasksPanel from "./TasksPanel";
import BlockersSection from "./BlockersSection";
import QuestionsSection from "./QuestionsSection";
import LinksSection from "./LinksSection";

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
  } = useTasks();
  const {
    projects,
    setBlockerDismissed,
    addBlocker,
    addQuestion,
    addLink,
    updateLink,
    deleteLink,
    updateProjectName,
    updateProjectDescription,
  } = useProjects();
  const { showSnackbar } = useSnackbarContext();
  const { projectId } = useParams<{ projectId: string }>();
  const selectedProjectId = projectId ?? "";
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [editingField, setEditingField] = useState<
    "name" | "description" | null
  >(null);
  const [errorText, setErrorText] = useState<string | null>(null);
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
    }),
    [
      setTaskComplete,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      archiveTask,
      duplicateTask,
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

import { IconButton, Stack, Tooltip } from "@mui/material";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import PushPin from "@mui/icons-material/PushPin";
import type { Task } from "../../../../types/projects";

const accentButtonSx = {
  color: "var(--color-on-accent)",
  p: 0.25,
  mt: 0.25,
  bgcolor: "var(--projects-metric-color)",
  "&:hover": {
    bgcolor: "var(--projects-metric-color)",
  },
  borderRadius: "4px",
} as const;

const deleteButtonSx = {
  color: "var(--color-on-accent)",
  p: 0.25,
  mt: 0.25,
  bgcolor: "var(--projects-error-color)",
  "&:hover": {
    bgcolor: "var(--projects-error-color)",
  },
  borderRadius: "4px",
} as const;

/** Tracked: white icon on green background */
const trackButtonTrackedSx = {
  color: "var(--color-on-accent)",
  p: 0.25,
  mt: 0.25,
  bgcolor: "var(--tasks-complete-color)",
  "&:hover": {
    bgcolor: "var(--tasks-complete-color)",
    opacity: 0.92,
  },
  borderRadius: "4px",
} as const;

export interface TaskItemActionsProps {
  task: Task;
  showAddIcon: boolean;
  showTrackButton: boolean;
  isTracked: boolean;
  showDeleteButton: boolean;
  onAddClick: (taskId: string) => void;
  onToggleTracked: (taskId: string) => void;
  onDeleteClick: () => void;
}

export default function TaskItemActions({
  task,
  showAddIcon,
  showTrackButton,
  isTracked,
  showDeleteButton,
  onAddClick,
  onToggleTracked,
  onDeleteClick,
}: TaskItemActionsProps) {
  const trackButton = (
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onToggleTracked(task.id);
      }}
      sx={isTracked ? trackButtonTrackedSx : accentButtonSx}
      aria-label={isTracked ? "Tracked" : "Track task"}
      aria-pressed={isTracked}
    >
      <PushPin sx={{ fontSize: 18 }} />
    </IconButton>
  );

  return (
    <Stack ml={1.5} direction="row" gap={1} sx={{ alignItems: "center" }}>
      {showAddIcon && (
        <Tooltip title="Add subtask" placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(task.id);
            }}
            sx={accentButtonSx}
            aria-label="Add subtask"
          >
            <Add sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {showTrackButton && (
        <Tooltip
          title={isTracked ? "Untrack task" : "Track task"}
          placement="top"
        >
          {trackButton}
        </Tooltip>
      )}
      {showDeleteButton && (
        <Tooltip title="Delete task" placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick();
            }}
            sx={deleteButtonSx}
            aria-label="Delete task"
          >
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

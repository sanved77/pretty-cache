import { IconButton, Stack, Tooltip } from "@mui/material";
import Add from "@mui/icons-material/Add";
import Archive from "@mui/icons-material/Archive";
import Unarchive from "@mui/icons-material/Unarchive";
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
  showArchiveButton: boolean;
  onAddClick: (taskId: string) => void;
  onToggleTracked: (taskId: string) => void;
  onArchiveClick: () => void;
}

export default function TaskItemActions({
  task,
  showAddIcon,
  showTrackButton,
  isTracked,
  showArchiveButton,
  onAddClick,
  onToggleTracked,
  onArchiveClick,
}: TaskItemActionsProps) {
  const archived = task.isArchived ?? false;
  const archiveTooltip = archived ? "Unarchive task" : "Archive task";
  const archiveAria = archived ? "Unarchive task" : "Archive task";

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
      {showArchiveButton && (
        <Tooltip title={archiveTooltip} placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onArchiveClick();
            }}
            sx={accentButtonSx}
            aria-label={archiveAria}
          >
            {archived ? (
              <Unarchive sx={{ fontSize: 18 }} />
            ) : (
              <Archive sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

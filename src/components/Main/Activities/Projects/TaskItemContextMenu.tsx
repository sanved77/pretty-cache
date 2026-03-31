import {
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Archive from "@mui/icons-material/Archive";
import Unarchive from "@mui/icons-material/Unarchive";
import Delete from "@mui/icons-material/Delete";
import ContentCopy from "@mui/icons-material/ContentCopy";
import type { Task } from "../../../../types/projects";

function formatTaskTimestamp(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const readOnlyMenuItemSx = {
  opacity: 1,
  cursor: "default",
  flexDirection: "column",
  alignItems: "flex-start",
  py: 1,
  "&.Mui-disabled": {
    opacity: 1,
  },
} as const;

export interface TaskItemContextMenuProps {
  open: boolean;
  contextMenu: { mouseX: number; mouseY: number } | null;
  task: Task;
  onClose: () => void;
  onAddSubtask: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onDuplicate: (taskId: string) => void;
}

export default function TaskItemContextMenu({
  open,
  contextMenu,
  task,
  onClose,
  onAddSubtask,
  onToggleArchive,
  onDelete,
  onDuplicate,
}: TaskItemContextMenuProps) {
  const archived = task.isArchived ?? false;

  const handleAddSubtask = () => {
    onAddSubtask();
    onClose();
  };

  const handleToggleArchive = () => {
    onToggleArchive();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate(task.id);
    onClose();
  };

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      MenuListProps={{
        "aria-labelledby": "task-context-menu",
      }}
    >
      <MenuItem
        onClick={handleAddSubtask}
        disabled={archived}
      >
        <ListItemIcon>
          <Add fontSize="small" />
        </ListItemIcon>
        Add Subtask
      </MenuItem>
      <MenuItem onClick={handleToggleArchive}>
        <ListItemIcon>
          {archived ? (
            <Unarchive fontSize="small" />
          ) : (
            <Archive fontSize="small" />
          )}
        </ListItemIcon>
        {archived ? "Unarchive" : "Archive"}
      </MenuItem>
      <MenuItem onClick={handleDelete}>
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        Delete
      </MenuItem>
      <MenuItem onClick={handleDuplicate}>
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        Duplicate
      </MenuItem>
      <Divider />
      <MenuItem disabled disableRipple sx={readOnlyMenuItemSx}>
        <Typography
          variant="caption"
          sx={{ color: "var(--scratchpad-text-muted)", display: "block", mb: 0.25 }}
        >
          Created
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--tasks-panel-bg)" }}>
          {formatTaskTimestamp(task.createdOn)}
        </Typography>
      </MenuItem>
      <MenuItem disabled disableRipple sx={readOnlyMenuItemSx}>
        <Typography
          variant="caption"
          sx={{ color: "var(--scratchpad-text-muted)", display: "block", mb: 0.25 }}
        >
          Completed
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--tasks-panel-bg)" }}>
          {task.completedOn != null
            ? formatTaskTimestamp(task.completedOn)
            : "Not completed"}
        </Typography>
      </MenuItem>
    </Menu>
  );
}

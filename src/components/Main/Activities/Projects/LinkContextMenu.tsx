import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import type { LinkObj } from "../../../../types/projects";

export interface LinkContextMenuProps {
  open: boolean;
  contextMenu: { mouseX: number; mouseY: number } | null;
  link: LinkObj;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LinkContextMenu({
  open,
  contextMenu,
  link: _link, // required by interface; parent uses contextMenu.link
  onClose,
  onEdit,
  onDelete,
}: LinkContextMenuProps) {
  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
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
        "aria-labelledby": "link-context-menu",
      }}
    >
      <MenuItem onClick={handleEdit}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        Edit
      </MenuItem>
      <MenuItem onClick={handleDelete}>
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        Delete
      </MenuItem>
    </Menu>
  );
}

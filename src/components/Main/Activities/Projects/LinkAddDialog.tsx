import type { ComponentType } from "react";
import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import Code from "@mui/icons-material/Code";
import Description from "@mui/icons-material/Description";
import ShowChart from "@mui/icons-material/ShowChart";
import Palette from "@mui/icons-material/Palette";
import Build from "@mui/icons-material/Build";
import LinkIcon from "@mui/icons-material/Link";

const TYPE_ICON_MAP: Record<string, ComponentType<{ sx?: object }>> = {
  Code,
  Telemetry: ShowChart,
  Docs: Description,
  Design: Palette,
  Tool: Build,
  Other: LinkIcon,
};

const LINK_TYPES = [
  "Docs",
  "Code",
  "Telemetry",
  "Design",
  "Tool",
  "Other",
] as const;

function getIconForType(type: string) {
  return TYPE_ICON_MAP[type] ?? LinkIcon;
}

function LinkTypeIcon({ type, sx }: { type: string; sx?: object }) {
  const Icon = TYPE_ICON_MAP[type] ?? LinkIcon;
  return <Icon sx={sx} />;
}

export interface LinkAddDialogProps {
  open: boolean;
  onClose: () => void;
  /** Create mode */
  onAdd?: (link: { label: string; url: string; type: string }) => void;
  /** Edit mode (provide together with onSave) */
  linkId?: string;
  initialLabel?: string;
  initialUrl?: string;
  initialType?: string;
  onSave?: (linkId: string, update: { label: string; url: string; type: string }) => void;
}

export default function LinkAddDialog({
  open,
  onClose,
  onAdd,
  linkId,
  initialLabel,
  initialUrl,
  initialType,
  onSave,
}: LinkAddDialogProps) {
  const isEditMode = Boolean(linkId && onSave);
  const [label, setLabel] = useState(initialLabel ?? "");
  const [url, setUrl] = useState(initialUrl ?? "");
  const [selectedType, setSelectedType] = useState<string>(initialType ?? "Docs");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const resetAndClose = useCallback(() => {
    setLabel("");
    setUrl("");
    setSelectedType("Docs");
    setAnchorEl(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    if (trimmedLabel.length === 0 || trimmedUrl.length === 0) return;
    const payload = { label: trimmedLabel, url: trimmedUrl, type: selectedType };
    if (isEditMode && linkId && onSave) {
      onSave(linkId, payload);
    } else if (onAdd) {
      onAdd(payload);
    }
    resetAndClose();
  }, [label, url, selectedType, isEditMode, linkId, onSave, onAdd, resetAndClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) {
          setAnchorEl(null);
        } else {
          resetAndClose();
        }
      }
      if (e.key === "Enter" && !menuOpen) {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    },
    [handleSubmit, resetAndClose, menuOpen],
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    handleMenuClose();
  };

  const canAdd = label.trim().length > 0 && url.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      onKeyDown={handleKeyDown}
      aria-labelledby="link-add-dialog-title"
    >
      <DialogTitle id="link-add-dialog-title">
        {isEditMode ? "Edit Link" : "Add new Link"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter label..."
          sx={{ mt: 1, minWidth: 500 }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            minWidth: 500,
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 1,
            }}
            aria-controls={menuOpen ? "link-type-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
          >
            <LinkTypeIcon type={selectedType} sx={{ fontSize: 20 }} />
          </IconButton>
          <Menu
            id="link-type-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
          >
            {LINK_TYPES.map((type) => {
              const Icon = getIconForType(type);
              return (
                <MenuItem
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  selected={selectedType === type}
                >
                  <Icon sx={{ fontSize: 18, mr: 1 }} />
                  {type}
                </MenuItem>
              );
            })}
          </Menu>
          <TextField
            fullWidth
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canAdd}>
          {isEditMode ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

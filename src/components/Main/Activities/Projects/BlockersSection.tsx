import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import ClearAll from "@mui/icons-material/ClearAll";
import Undo from "@mui/icons-material/Undo";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { Blocker } from "../../../../types/projects";
import {
  SECTION_HEADER_COLORS,
  sectionHeaderActionHiddenSx,
  sectionHeaderRowSx,
  sectionHeaderTypographySx,
} from "../../../../styles/sectionHeaderSx";
import ContentAddDialog from "./ContentAddDialog";

export interface BlockersSectionProps {
  blockers: Blocker[];
  onDismissBlocker?: (blockerId: string) => void;
  onUndismissBlocker?: (blockerId: string) => void;
  onAddBlocker?: (text: string) => void;
}

export default function BlockersSection({
  blockers,
  onDismissBlocker,
  onUndismissBlocker,
  onAddBlocker,
}: BlockersSectionProps) {
  const [hoveredOn, setHoveredOn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const visible = blockers.filter((b) => b.dismissedOn == null);

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={sectionHeaderRowSx}
        onMouseEnter={() => setHoveredOn(true)}
        onMouseLeave={() => setHoveredOn(false)}
      >
        <Typography
          sx={{
            ...sectionHeaderTypographySx,
            color: SECTION_HEADER_COLORS.blockers,
          }}
        >
          Blockers
        </Typography>
        {onAddBlocker && (
          <Tooltip title="Add blocker" placement="top">
            <IconButton
              size="small"
              onClick={() => setDialogOpen(true)}
              tabIndex={hoveredOn ? 0 : -1}
              sx={{
                p: 0.5,
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: "50%",
                color: "var(--color-on-accent)",
                bgcolor: "var(--projects-blockers-color)",
                "&:hover": {
                  bgcolor: "var(--projects-blockers-color)",
                  opacity: 0.9,
                },
                ...(hoveredOn ? {} : sectionHeaderActionHiddenSx),
              }}
              aria-hidden={!hoveredOn}
              aria-label="Add blocker"
            >
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          title={
            showDismissed
              ? "Hide dismissed blockers"
              : "Show dismissed blockers"
          }
          placement="top"
        >
          <IconButton
            size="small"
            onClick={() => setShowDismissed((prev) => !prev)}
            tabIndex={hoveredOn ? 0 : -1}
            sx={{
              p: 0.5,
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: "50%",
              color: "var(--color-on-accent)",
              bgcolor: "var(--projects-blockers-color)",
              "&:hover": {
                bgcolor: "var(--projects-blockers-color)",
                opacity: 0.9,
              },
              ...(hoveredOn ? {} : sectionHeaderActionHiddenSx),
            }}
            aria-hidden={!hoveredOn}
            aria-label={
              showDismissed
                ? "Hide dismissed blockers"
                : "Show dismissed blockers"
            }
          >
            {showDismissed ? (
              <Visibility sx={{ fontSize: 18 }} />
            ) : (
              <VisibilityOff sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      {(showDismissed ? blockers : visible).length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {blockers.map((entry) => {
            const isDismissed = entry.dismissedOn != null;
            if (isDismissed && !showDismissed) return null;
            return (
              <Box
                key={entry.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "var(--blockers-item-bg)",
                  opacity: isDismissed ? 0.6 : 1,
                  border: "1px solid var(--blockers-item-border)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--scratchpad-text)",
                    fontStyle: isDismissed ? "italic" : "normal",
                    flex: 1,
                  }}
                >
                  {entry.text}
                </Typography>
                {!isDismissed ? (
                  <Tooltip title="Dismiss blocker" placement="top">
                    <IconButton
                      size="small"
                      onClick={() => onDismissBlocker?.(entry.id)}
                      sx={{ p: 0.25, color: "var(--scratchpad-text-muted)" }}
                      aria-label="Dismiss blocker"
                    >
                      <ClearAll sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Restore blocker" placement="top">
                    <IconButton
                      size="small"
                      onClick={() => onUndismissBlocker?.(entry.id)}
                      sx={{ p: 0.25, color: "var(--scratchpad-text-muted)" }}
                      aria-label="Restore blocker"
                    >
                      <Undo sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: "var(--scratchpad-text-muted)",
            fontStyle: "italic",
          }}
        >
          Nothing blocking now
        </Typography>
      )}
      <ContentAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type="blocker"
        onAdd={(text) => onAddBlocker?.(text)}
      />
    </Box>
  );
}

import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import ClearAll from "@mui/icons-material/ClearAll";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type { BlockerEntry } from "../../../../types/projects";
import ContentAddDialog from "./ContentAddDialog";

export interface BlockersSectionProps {
  blockers: BlockerEntry[];
  onDismissBlocker?: (index: number) => void;
  onAddBlocker?: (text: string) => void;
}

export default function BlockersSection({
  blockers,
  onDismissBlocker,
  onAddBlocker,
}: BlockersSectionProps) {
  const [hoveredOn, setHoveredOn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const visible = blockers.filter((b) => !b.dismissed);

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
        onMouseEnter={() => setHoveredOn(true)}
        onMouseLeave={() => setHoveredOn(false)}
      >
        <Typography
          sx={{
            fontSize: 20,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 900,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: "var(--projects-blockers-color)",
          }}
        >
          Blockers
        </Typography>
        {onAddBlocker && hoveredOn && (
          <Tooltip title="Add blocker" placement="top">
            <IconButton
              size="small"
              onClick={() => setDialogOpen(true)}
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
              }}
              aria-label="Add blocker"
            >
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        {hoveredOn && (
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
              }}
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
        )}
        <Box
          sx={{
            flex: 1,
            opacity: 0.5,
            height: "0.5px",
            backgroundColor: "var(--projects-blockers-color)",
            minWidth: 8,
          }}
        />
      </Box>
      {(showDismissed ? blockers : visible).length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {blockers.map((entry, i) => {
            if (entry.dismissed && !showDismissed) return null;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1,
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "var(--blockers-item-bg)",
                  opacity: entry.dismissed ? 0.6 : 1,
                  border: "1px solid var(--blockers-item-border)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--scratchpad-text)",
                    fontStyle: entry.dismissed ? "italic" : "normal",
                    // opacity: entry.dismissed ? 0.7 : 1,
                    flex: 1,
                  }}
                >
                  {entry.text}
                </Typography>
                <Tooltip title="Dismiss blocker" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => onDismissBlocker?.(i)}
                    sx={{ p: 0.25, color: "var(--scratchpad-text-muted)" }}
                    aria-label="Dismiss blocker"
                  >
                    <ClearAll sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{
            p: 1.5,
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

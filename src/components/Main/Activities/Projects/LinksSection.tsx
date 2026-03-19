import type { ComponentType } from "react";
import { useState, useMemo } from "react";
import { Box, IconButton, Link, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import Code from "@mui/icons-material/Code";
import Description from "@mui/icons-material/Description";
import ShowChart from "@mui/icons-material/ShowChart";
import Palette from "@mui/icons-material/Palette";
import Build from "@mui/icons-material/Build";
import LinkIcon from "@mui/icons-material/Link";
import type { LinkObj } from "../../../../types/projects";
import LinkAddDialog from "./LinkAddDialog";

const TYPE_ICON_MAP: Record<string, ComponentType<{ sx?: object }>> = {
  Code: Code,
  Telemetry: ShowChart,
  Docs: Description,
  Design: Palette,
  Tool: Build,
  Other: LinkIcon,
};

function getIconForType(type?: string) {
  if (!type) return LinkIcon;
  return TYPE_ICON_MAP[type] ?? LinkIcon;
}

export interface LinksSectionProps {
  links: LinkObj[];
  onAddLink?: (link: { label: string; url: string; type: string }) => void;
}

export default function LinksSection({ links, onAddLink }: LinksSectionProps) {
  const [hoveredOn, setHoveredOn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const sorted = useMemo(
    () => [...links].sort((a, b) => a.label.localeCompare(b.label)),
    [links],
  );

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
            color: "var(--projects-metric-color)",
          }}
        >
          Context Links
        </Typography>
        {onAddLink && hoveredOn && (
          <IconButton
            size="small"
            onClick={() => setDialogOpen(true)}
            sx={{
              p: 0.5,
              width: 24,
              height: 24,
              flexShrink: 0,
              borderRadius: "50%",
              color: "#ffffff",
              bgcolor: "var(--projects-metric-color)",
              "&:hover": { bgcolor: "var(--projects-metric-color)", opacity: 0.9 },
            }}
            aria-label="Add link"
          >
            <Add sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        <Box
          sx={{
            flex: 1,
            opacity: 0.5,
            height: "0.5px",
            backgroundColor: "var(--projects-metric-color)",
            minWidth: 8,
          }}
        />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 1, width: "fit-content" }}>
        {sorted.length > 0 &&
        sorted.map((link, i) => {
          const Icon = getIconForType(link.type);
          return (
            <Link
              key={i}
              href={link.url}
              target="_blank"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: "var(--tasks-panel-bg)",
                color: "var(--scratchpad-text)",
                "&:hover": { bgcolor: "var(--tasks-panel-bg)" },
              }}
            >
              <Icon
                sx={{ fontSize: 18, color: "var(--tasks-text)" }}
              />
              <Typography variant="body2">{link.label}</Typography>
            </Link>
          );
        })}
      </Box>
      <LinkAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={(link) => onAddLink?.(link)}
      />
    </Box>
  );
}

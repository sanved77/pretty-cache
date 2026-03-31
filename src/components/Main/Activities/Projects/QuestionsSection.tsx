import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ContentAddDialog from "./ContentAddDialog";

export interface QuestionsSectionProps {
  questions: string[];
  onAddQuestion?: (text: string) => void;
}

export default function QuestionsSection({
  questions,
  onAddQuestion,
}: QuestionsSectionProps) {
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [hoveredOn, setHoveredOn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleResolved = (index: number) => {
    setResolved((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

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
            color: "var(--projects-questions-color)",
          }}
        >
          Open Questions
        </Typography>

        {onAddQuestion && hoveredOn && (
          <Tooltip title="Add question" placement="top">
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
                bgcolor: "var(--projects-questions-color)",
                "&:hover": {
                  bgcolor: "var(--projects-questions-color)",
                  opacity: 0.9,
                },
              }}
              aria-label="Add question"
            >
              <Add sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        <Box
          sx={{
            flex: 1,
            opacity: 0.5,
            height: "0.5px",
            backgroundColor: "var(--projects-questions-color)",
            minWidth: 8,
          }}
        />
      </Box>
      {questions.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {questions.map((text, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                p: 1.5,
                borderLeft: "4px solid var(--projects-questions-color)",
                bgcolor: "var(--tasks-panel-bg)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "var(--scratchpad-text)",
                  flex: 1,
                  textDecoration: resolved.has(i) ? "line-through" : "none",
                  opacity: resolved.has(i) ? 0.7 : 1,
                }}
              >
                {text}
              </Typography>
              <Tooltip
                title={
                  resolved.has(i) ? "Mark unresolved" : "Mark resolved"
                }
                placement="top"
              >
                <IconButton
                  size="small"
                  onClick={() => toggleResolved(i)}
                  sx={{ p: 0.25 }}
                  aria-label={
                    resolved.has(i) ? "Mark unresolved" : "Mark resolved"
                  }
                >
                  <CheckCircleOutline
                    sx={{
                      fontSize: 18,
                      color: resolved.has(i)
                        ? "var(--tasks-complete-color)"
                        : "var(--scratchpad-text-muted)",
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}
      <ContentAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type="question"
        onAdd={(text) => onAddQuestion?.(text)}
      />
    </Box>
  );
}

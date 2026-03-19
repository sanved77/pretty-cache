import { Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";

export default function ProjectHome() {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "var(--projects-bg)",
        color: "var(--scratchpad-text)",
        minHeight: "100%",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Projects
      </Typography>
      <Link
        to="/projects/proj-1"
        style={{ color: "var(--projects-metric-color)" }}
      >
        Auth Module (proj-1)
      </Link>
    </Box>
  );
}

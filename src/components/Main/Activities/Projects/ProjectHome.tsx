import { useMemo, useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  type SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Search from "@mui/icons-material/Search";
import ChevronRight from "@mui/icons-material/ChevronRight";
import PushPin from "@mui/icons-material/PushPin";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import HelpOutline from "@mui/icons-material/HelpOutline";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import { DateRange, type RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useProjects } from "../../../../hooks/useProjects";
import { useTasks } from "../../../../hooks/useTasks";
import { useSnackbarContext } from "../../../../contexts/useSnackbarContext";
import type { Project, ProjectStatus } from "../../../../types/projects";
import { getProjectCompletion } from "../../../../utils/projectCompletion";
import { isCreatedOnInDateRange } from "../../../../utils/dateRangeFilter";
import CreateProjectDialog from "./CreateProjectDialog";
import {
  getDisplayStatus,
  statusPillSx,
} from "./projectStatusDisplay";

const PAGE_SIZE = 10;
const ALL_STATUSES: ProjectStatus[] = ["Open", "Close", "Paused", "Blocked"];

function formatCreatedOn(ms: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

function activeBlockerCount(project: Project): number {
  return project.blockers.filter((b) => !b.dismissed).length;
}

export default function ProjectHome() {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const {
    projects,
    trackedProjectIds,
    toggleTrackedProject,
    isProjectTracked,
    createProject,
  } = useProjects();
  const { showSnackbar } = useSnackbarContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus[]>([]);
  const [dateFilter, setDateFilter] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [rangeAnchor, setRangeAnchor] = useState<HTMLElement | null>(null);
  const [listPivot, setListPivot] = useState(0);

  const [rangeSelection, setRangeSelection] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const nonArchivedTasks = useMemo(
    () => tasks.filter((t) => !t.isArchived),
    [tasks],
  );

  const trackedSet = useMemo(
    () => new Set(trackedProjectIds),
    [trackedProjectIds],
  );

  const trackedProjectsList = useMemo(() => {
    const list: Project[] = [];
    for (const id of trackedProjectIds) {
      const p = projects.find((x) => x.id === id);
      if (p) list.push(p);
    }
    return list;
  }, [trackedProjectIds, projects]);

  const defaultListBase = useMemo(
    () => projects.filter((p) => !trackedSet.has(p.id)),
    [projects, trackedSet],
  );

  const filteredDefaultList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return defaultListBase.filter((p) => {
      if (q.length > 0) {
        const name = p.projectName.toLowerCase();
        const desc = p.description.toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      if (statusFilter.length > 0) {
        const st = getDisplayStatus(p.status);
        if (!statusFilter.includes(st)) return false;
      }
      if (!isCreatedOnInDateRange(p.createdOn, dateFilter)) return false;
      return true;
    });
  }, [defaultListBase, search, statusFilter, dateFilter]);

  useEffect(() => {
    setListPivot(0);
  }, [search, statusFilter, dateFilter, defaultListBase.length]);

  const maxPivot = useMemo(() => {
    const n = filteredDefaultList.length;
    if (n === 0) return 0;
    return Math.floor((n - 1) / PAGE_SIZE) * PAGE_SIZE;
  }, [filteredDefaultList.length]);

  const pageSlice = useMemo(
    () => filteredDefaultList.slice(listPivot, listPivot + PAGE_SIZE),
    [filteredDefaultList, listPivot],
  );

  const handleStatusFilterChange = (e: SelectChangeEvent<typeof ALL_STATUSES>) => {
    const v = e.target.value;
    setStatusFilter(
      typeof v === "string" ? (v.split(",") as ProjectStatus[]) : [...v],
    );
  };

  const handleRangeChange = (ranges: RangeKeyDict) => {
    const sel = ranges.selection;
    if (sel.startDate && sel.endDate) {
      setRangeSelection({
        startDate: sel.startDate,
        endDate: sel.endDate,
        key: "selection",
      });
    }
  };

  const applyDateRange = () => {
    setDateFilter({
      start: rangeSelection.startDate,
      end: rangeSelection.endDate,
    });
    setRangeAnchor(null);
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    setRangeAnchor(null);
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "var(--projects-bg)",
        color: "var(--scratchpad-text)",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: "var(--projects-metric-color)" }}
        >
          Create project
        </Button>
      </Box>

      {/* Tracked projects */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
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
            Tracked projects
          </Typography>
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

        {trackedProjectsList.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              p: 1.5,
              color: "var(--scratchpad-text-muted)",
              fontStyle: "italic",
            }}
          >
            No tracked projects
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {trackedProjectsList.map((project) => {
              const { completed, total } = getProjectCompletion(
                nonArchivedTasks,
                project.id,
                taskMap,
              );
              const percent =
                total > 0 ? Math.round((completed / total) * 100) : 0;
              const blockers = activeBlockerCount(project);
              const qCount = project.questions.length;

              return (
                <Box
                  key={project.id}
                  component={RouterLink}
                  to={`/projects/${project.id}`}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    borderLeft: "4px solid var(--projects-metric-color)",
                    bgcolor: "var(--tasks-panel-bg)",
                    p: 1.5,
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "var(--tasks-highlight-bg)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      mb: 1,
                      color: "var(--scratchpad-text)",
                    }}
                  >
                    {project.projectName}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box
                      sx={{
                        flex: "1 1 0",
                        minWidth: 120,
                        maxWidth: "80%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: "var(--projects-inactive)",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "var(--projects-metric-color)",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--projects-metric-color)",
                          fontWeight: 600,
                          flexShrink: 0,
                          minWidth: 40,
                        }}
                      >
                        {percent}%
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexShrink: 0,
                      }}
                    >
                      {blockers > 0 ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: "rgba(244, 63, 94, 0.25)",
                            color: "var(--projects-blockers-color)",
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          <ErrorOutline sx={{ fontSize: 16 }} />
                          {blockers} blockers
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            px: 1,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: "rgba(76, 175, 80, 0.2)",
                            color: "var(--tasks-complete-color)",
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "uppercase",
                          }}
                        >
                          <CheckCircleOutline sx={{ fontSize: 16 }} />
                          No blockers
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1,
                          py: 0.5,
                          borderRadius: "16px",
                          bgcolor: "rgba(251, 146, 60, 0.2)",
                          color: "var(--projects-questions-color)",
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        <HelpOutline sx={{ fontSize: 16 }} />
                        {qCount} Q&A
                      </Box>
                      <ChevronRight
                        sx={{ color: "var(--scratchpad-text-muted)", ml: 0.5 }}
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Default list */}
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--scratchpad-text-muted)",
          mb: 1.5,
        }}
      >
        All projects
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          placeholder="Filter projects by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            flex: "1 1 40%",
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              bgcolor: "var(--tasks-panel-bg)",
              color: "var(--scratchpad-text)",
              "& fieldset": { borderColor: "var(--scratchpad-separator)" },
              "&:hover fieldset": { borderColor: "var(--projects-metric-color)" },
              "&.Mui-focused fieldset": { borderColor: "var(--projects-metric-color)" },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "var(--scratchpad-text-muted)",
              opacity: 1,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "var(--scratchpad-text-muted)" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Select<ProjectStatus[]>
          multiple
          displayEmpty
          value={statusFilter}
          onChange={handleStatusFilterChange}
          input={
            <OutlinedInput
              size="small"
              sx={{
                bgcolor: "var(--tasks-panel-bg)",
                color: "var(--scratchpad-text)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--scratchpad-separator)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--projects-metric-color)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--projects-metric-color)",
                },
                "& .MuiSvgIcon-root": { color: "var(--scratchpad-text-muted)" },
              }}
            />
          }
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: "var(--tasks-panel-bg)",
                color: "var(--scratchpad-text)",
                border: "1px solid var(--scratchpad-separator)",
                "& .MuiMenuItem-root:hover": {
                  bgcolor: "var(--tasks-highlight-bg)",
                },
                "& .MuiMenuItem-root.Mui-selected": {
                  bgcolor: "rgba(15, 166, 242, 0.15)",
                },
                "& .MuiMenuItem-root.Mui-selected:hover": {
                  bgcolor: "var(--tasks-highlight-bg)",
                },
              },
            },
          }}
          renderValue={(selected) =>
            selected.length === 0 ? (
              <Typography component="span" sx={{ color: "var(--scratchpad-text-muted)", fontSize: 14 }}>
                Status: all
              </Typography>
            ) : (
              <Typography component="span" sx={{ color: "var(--scratchpad-text)", fontSize: 14 }}>
                Status: {selected.join(", ")}
              </Typography>
            )
          }
          sx={{ minWidth: 180 }}
        >
          {ALL_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
        <Button
          size="small"
          variant="outlined"
          startIcon={<CalendarMonth sx={{ fontSize: 16 }} />}
          onClick={(e) => setRangeAnchor(e.currentTarget)}
          sx={{
            bgcolor: "var(--tasks-panel-bg)",
            borderColor: "var(--scratchpad-separator)",
            color: dateFilter == null ? "var(--scratchpad-text-muted)" : "var(--scratchpad-text)",
            fontWeight: dateFilter == null ? 400 : 600,
            fontSize: 14,
            textTransform: "none",
            "&:hover": {
              bgcolor: "var(--tasks-panel-bg)",
              borderColor: "var(--projects-metric-color)",
              color: "var(--scratchpad-text)",
            },
          }}
        >
          {dateFilter == null
            ? "Date: all"
            : `${formatCreatedOn(dateFilter.start.getTime())} – ${formatCreatedOn(dateFilter.end.getTime())}`}
        </Button>
        {dateFilter != null && (
          <Button
            size="small"
            onClick={clearDateFilter}
            sx={{
              color: "var(--scratchpad-text-muted)",
              textTransform: "none",
              fontSize: 13,
              "&:hover": { color: "var(--projects-blockers-color)" },
            }}
          >
            Clear dates
          </Button>
        )}
      </Box>

      <Popover
        open={Boolean(rangeAnchor)}
        anchorEl={rangeAnchor}
        onClose={() => setRangeAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 1 }}>
          <DateRange
            ranges={[rangeSelection]}
            onChange={handleRangeChange}
            moveRangeOnFirstSelection={false}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 1 }}>
            <Button size="small" onClick={() => setRangeAnchor(null)}>
              Cancel
            </Button>
            <Button size="small" variant="contained" onClick={applyDateRange}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>

      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                color: "var(--scratchpad-text-muted)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                borderColor: "var(--scratchpad-separator)",
              }}
            >
              Title
            </TableCell>
            <TableCell
              sx={{
                color: "var(--scratchpad-text-muted)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                borderColor: "var(--scratchpad-separator)",
              }}
            >
              Created on
            </TableCell>
            <TableCell
              sx={{
                color: "var(--scratchpad-text-muted)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                borderColor: "var(--scratchpad-separator)",
              }}
            >
              Status
            </TableCell>
            <TableCell
              align="right"
              sx={{
                color: "var(--scratchpad-text-muted)",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                borderColor: "var(--scratchpad-separator)",
                width: 48,
              }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {pageSlice.map((project) => {
            const st = getDisplayStatus(project.status);
            const pill = statusPillSx(st);
            const tracked = isProjectTracked(project.id);
            return (
              <TableRow
                key={project.id}
                hover
                sx={{ "& td": { borderColor: "var(--scratchpad-separator)" } }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      component={RouterLink}
                      to={`/projects/${project.id}`}
                      sx={{
                        color: "var(--scratchpad-text)",
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {project.projectName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "var(--scratchpad-text-muted)" }}>
                  {formatCreatedOn(project.createdOn)}
                </TableCell>
                <TableCell>
                  <Typography
                    component="span"
                    sx={{
                      ...pill,
                      px: 1.25,
                      py: 0.35,
                      borderRadius: "12px",
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      display: "inline-block",
                    }}
                  >
                    {st}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip
                    title={tracked ? "Untrack project" : "Track project"}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleTrackedProject(project.id);
                      }}
                      sx={{
                        color: tracked
                          ? "var(--tasks-complete-color)"
                          : "var(--scratchpad-text-muted)",
                      }}
                      aria-label={tracked ? "Untrack project" : "Track project"}
                    >
                      <PushPin
                        sx={{
                          fontSize: 20,
                          transform: tracked ? "none" : "rotate(45deg)",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredDefaultList.length === 0 && (
        <Typography
          variant="body2"
          sx={{ color: "var(--scratchpad-text-muted)", mb: 2 }}
        >
          No projects match your filters.
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "auto",
          pt: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: "var(--scratchpad-text-muted)" }}>
          {filteredDefaultList.length === 0
            ? "Showing 0 of 0 projects"
            : `Showing ${listPivot + 1}-${Math.min(listPivot + PAGE_SIZE, filteredDefaultList.length)} of ${filteredDefaultList.length} projects`}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={listPivot === 0}
            onClick={() => setListPivot((p) => Math.max(0, p - PAGE_SIZE))}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={listPivot + PAGE_SIZE >= filteredDefaultList.length}
            onClick={() =>
              setListPivot((p) => Math.min(p + PAGE_SIZE, maxPivot))
            }
          >
            Next
          </Button>
        </Box>
      </Box>

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        createProject={createProject}
        onCreated={(projectId) => {
          showSnackbar("success", "Project created");
          navigate(`/projects/${projectId}`);
        }}
      />
    </Box>
  );
}

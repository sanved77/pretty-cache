import { useState, useEffect, useMemo, useCallback, useRef, type KeyboardEvent } from 'react'
import { USER_NAME_CHANGED_EVENT } from '../../../../dev/missionControlStorage'
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import HelpOutline from '@mui/icons-material/HelpOutline'
import { getLinkTypeConfig } from '../../../../utils/linkTypeConfig'
import Add from '@mui/icons-material/Add'
import { NavLink } from 'react-router-dom'
import { useToday } from '../../../../hooks/useToday'
import { useParkingLot } from '../../../../hooks/useParkingLot'
import { useTasks } from '../../../../hooks/useTasks'
import { useProjects } from '../../../../hooks/useProjects'
import { useBlockers } from '../../../../hooks/useBlockers'
import { readTrackedProjectsSnapshot } from '../../../../utils/trackedProjectsSnapshot'
import { getProjectColor } from '../../../../utils/projectColor'
import { getProjectCompletion } from '../../../../utils/projectCompletion'
import { formatProjectDeadlineRemaining } from '../../../../utils/projectDeadlineRemaining'
import { openLink } from '../../../../utils/openLink'
import type { Task, Project } from '../../../../types/projects'
import SectionTitle from '../../../shared/SectionTitle'
import { cardSx } from '../../../../styles/cardSx'
import { APP_FONT_FAMILY } from '../../../../styles/appFont'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'
import { useSnackbarContext } from '../../../../contexts/useSnackbarContext'

const MONO = APP_FONT_FAMILY

const STATUS_COLORS: Record<string, string> = {
  Open: '#22c55e',
  Close: '#64748b',
  Paused: '#facc15',
  Blocked: '#ef4444',
}

const TIME_SLOTS = [
  { start: 5, end: 12, label: 'morning' },
  { start: 12, end: 17, label: 'afternoon' },
  { start: 17, end: 21, label: 'evening' },
  { start: 21, end: 5, label: 'night' },
] as const

function getGreeting(): string {
  const h = new Date().getHours()
  const slot = TIME_SLOTS.find((s) =>
    s.start < s.end ? h >= s.start && h < s.end : h >= s.start || h < s.end,
  )
  return `Good ${slot?.label ?? 'day'}`
}

function getTimeHint(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return 'Early start — set your priorities'
  if (h >= 9 && h < 12) return 'Peak focus window — deep work time'
  if (h >= 12 && h < 14) return 'Midday — review progress'
  if (h >= 14 && h < 17) return 'Afternoon push — finish strong'
  if (h >= 17 && h < 21) return 'Winding down — wrap up loose ends'
  return 'Night owl — plan for tomorrow'
}

function getDayProgress(): number {
  const now = new Date()
  const h = now.getHours() + now.getMinutes() / 60
  const start = 9
  const end = 18
  if (h <= start) return 0
  if (h >= end) return 100
  return ((h - start) / (end - start)) * 100
}

function formatClock(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `Captured ${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Captured ${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Captured yesterday'
  return `Captured ${days}d ago`
}

/* ---------- Card shell ---------- */

/* ---------- Day Progress Ring (SVG) ---------- */

function DayProgressRing({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={r} fill="none" stroke="#21262d" strokeWidth={4} />
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#22c55e"
        strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text
        x={24}
        y={24}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e6edf3"
        fontSize={11}
        fontFamily={MONO}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

/* ---------- HeaderBar ---------- */

function HeaderBar({ name }: { name: string }) {
  const [clock, setClock] = useState(formatClock)
  const [pct, setPct] = useState(getDayProgress)

  useEffect(() => {
    const id = setInterval(() => {
      setClock(formatClock())
      setPct(getDayProgress())
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const greeting = getGreeting()
  const hint = getTimeHint()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1.2 }}
        >
          {greeting}, {name || 'there'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#8b949e', mt: 0.5, fontFamily: MONO }}>
          {hint}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ fontFamily: MONO, fontSize: '0.85rem', color: '#8b949e' }}>
          {clock}
        </Typography>
        <DayProgressRing pct={pct} />
      </Box>
    </Box>
  )
}

/* ---------- MomentumBar ---------- */

function MomentumBar({ count }: { count: number }) {
  return (
    <Box
      sx={{
        ...cardSx,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
      }}
    >
      <Typography sx={{ fontFamily: MONO, fontSize: '1.6rem', fontWeight: 700, color: '#22c55e' }}>
        {count}
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#8b949e' }}>tasks completed today</Typography>
    </Box>
  )
}

/* ---------- FocusCard ---------- */

function FocusCard({
  task,
  project,
}: {
  task: Task
  project: Project | undefined
}) {
  return (
    <Box
      sx={{
        ...cardSx,
        borderColor: '#1f6feb',
        borderWidth: 1.5,
        position: 'relative',
        pt: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -9,
          left: 14,
          bgcolor: '#1f6feb',
          color: '#fff',
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          px: 1.25,
          py: 0.25,
          borderRadius: '4px',
          lineHeight: 1.6,
        }}
      >
        Focus — Next Up
      </Box>
      <Typography sx={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>
        {task.content}
      </Typography>
      {project && (
        <Typography
          component={NavLink}
          to={`/projects/${project.id}`}
          sx={{
            color: getProjectColor(project.id),
            fontSize: '0.75rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {project.projectName}
        </Typography>
      )}
    </Box>
  )
}

/* ---------- TodaysPlan ---------- */

function TodaysPlan() {
  const { items, addItem, toggleItem } = useToday()
  const { showSnackbar } = useSnackbarContext()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    window.addEventListener('focus-today-input', handler)
    return () => window.removeEventListener('focus-today-input', handler)
  }, [])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = input.trim()
        if (trimmed) {
          addItem(input)
          showSnackbar('success', "Added to today's plan")
        }
        setInput('')
      }
    },
    [addItem, input, showSnackbar],
  )

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.todaysPlan}>Today's Plan</SectionTitle>
    <Box sx={cardSx}>
      <TextField
        placeholder="Add an item..."
        fullWidth
        size="small"
        value={input}
        inputRef={inputRef}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        slotProps={{
          input: {
            sx: {
              fontSize: '0.85rem',
              color: '#e6edf3',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
            },
          },
        }}
        sx={{ mb: 1.5 }}
      />
      {items.length === 0 && (
        <Typography sx={{ color: '#484f58', fontSize: '0.8rem', fontStyle: 'italic' }}>
          No items yet — add your goals for today
        </Typography>
      )}
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}
        >
          <Checkbox
            checked={item.status === 'done'}
            onChange={() => toggleItem(item.id)}
            size="small"
            sx={{ color: '#30363d', '&.Mui-checked': { color: '#22c55e' }, p: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: item.status === 'done' ? '#484f58' : '#e6edf3',
              textDecoration: item.status === 'done' ? 'line-through' : 'none',
            }}
          >
            {item.content}
          </Typography>
        </Box>
      ))}
    </Box>
    </>
  )
}

/* ---------- TrackedProjects ---------- */

function TrackedProjectsSection({ tasks }: { tasks: Task[] }) {
  const [trackedProjects, setTrackedProjects] = useState(readTrackedProjectsSnapshot)
  const { blockers: allBlockers } = useBlockers()

  useEffect(() => {
    const onUpdate = () => setTrackedProjects(readTrackedProjectsSnapshot())
    window.addEventListener('missioncontrol-projects-updated', onUpdate)
    return () => window.removeEventListener('missioncontrol-projects-updated', onUpdate)
  }, [])

  const taskMap = useMemo(() => {
    const m = new Map<string, Task>()
    tasks.forEach((t) => m.set(t.id, t))
    return m
  }, [tasks])

  if (trackedProjects.length === 0) {
    return (
      <>
        <SectionTitle color={SECTION_HEADER_COLORS.trackedProjects}>Tracked Projects</SectionTitle>
        <Box sx={cardSx}>
          <Typography sx={{ color: '#484f58', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Pin projects to see them here
          </Typography>
        </Box>
      </>
    )
  }

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.trackedProjects}>Tracked Projects</SectionTitle>
    <Box sx={cardSx}>
      {trackedProjects.map((project) => {
        const { completed, total } = getProjectCompletion(tasks, project.id, taskMap)
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
        const activeBlockers = project.blockers.filter((bid) => {
          const b = allBlockers.find((x) => x.id === bid)
          return b != null && b.dismissedOn == null
        }).length
        const color = getProjectColor(project.id)

        return (
          <Box
            key={project.id}
            sx={{
              mb: 2,
              pb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <Typography
                component={NavLink}
                to={`/projects/${project.id}`}
                sx={{
                  color: '#e6edf3',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  flex: 1,
                }}
              >
                {project.projectName}
              </Typography>
              {project.status && (
                <Chip
                  label={project.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: `${STATUS_COLORS[project.status] ?? '#64748b'}18`,
                    color: STATUS_COLORS[project.status] ?? '#64748b',
                    border: `1px solid ${STATUS_COLORS[project.status] ?? '#64748b'}40`,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#21262d',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: color,
                    borderRadius: 2,
                  },
                }}
              />
              <Typography sx={{ fontFamily: MONO, fontSize: '0.7rem', color: '#8b949e', minWidth: 35, textAlign: 'right' }}>
                {pct}%
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {activeBlockers > 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: '#f85149', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <ErrorOutline sx={{ fontSize: 15 }} />
                  {activeBlockers} blocker{activeBlockers > 1 ? 's' : ''}
                </Typography>
              )}
              {project.questions.length > 0 && (
                <Typography sx={{ fontSize: '0.7rem', color: '#d29922', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <HelpOutline sx={{ fontSize: 15 }} />
                  {project.questions.length} question{project.questions.length > 1 ? 's' : ''}
                </Typography>
              )}
              {project.deadlineOn && (
                <Typography sx={{ fontSize: '0.7rem', color: '#8b949e' }}>
                  {formatProjectDeadlineRemaining(project.deadlineOn)}
                </Typography>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
    </>
  )
}

/* ---------- BlockerQuestionStats ---------- */

function BlockerQuestionStats({ projects }: { projects: Project[] }) {
  const { blockers: allBlockers } = useBlockers()
  const totalBlockers = projects.reduce(
    (acc, p) => acc + p.blockers.filter((bid) => {
      const b = allBlockers.find((x) => x.id === bid)
      return b != null && b.dismissedOn == null
    }).length,
    0,
  )
  const totalQuestions = projects.reduce((acc, p) => acc + p.questions.length, 0)

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          ...cardSx,
          mb: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
        }}
      >
        <ErrorOutline sx={{ color: '#f85149', fontSize: 26 }} />
        <Box>
          <Typography sx={{ fontFamily: MONO, fontSize: '1.2rem', fontWeight: 700, color: '#f85149' }}>
            {totalBlockers}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#8b949e' }}>Active Blockers</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          ...cardSx,
          mb: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
        }}
      >
        <HelpOutline sx={{ color: '#d29922', fontSize: 26 }} />
        <Box>
          <Typography sx={{ fontFamily: MONO, fontSize: '1.2rem', fontWeight: 700, color: '#d29922' }}>
            {totalQuestions}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: '#8b949e' }}>Open Questions</Typography>
        </Box>
      </Box>
    </Box>
  )
}

/* ---------- ContextLinks ---------- */

function ContextLinks({ projects, incrementLinkVisits }: { projects: Project[]; incrementLinkVisits: (id: string) => void }) {
  const links = useMemo(() => {
    const all = projects.flatMap((p) =>
      (p.links ?? []).map((l) => ({ ...l, projectName: p.projectName, projectId: p.id })),
    )
    return all.slice(0, 10)
  }, [projects])

  if (links.length === 0) return null

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.contextLinks}>Context Links</SectionTitle>
    <Box sx={cardSx}>
      {links.map((link) => {
        const { Icon, iconColor } = getLinkTypeConfig(link.type)
        return (
          <Box
            key={link.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.6,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => openLink(link.id, link.url, incrementLinkVisits)}
          >
            <Icon sx={{ fontSize: 18, color: iconColor }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#58a6ff', flex: 1 }}>
              {link.label}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#484f58' }}>
              {link.projectName}
            </Typography>
          </Box>
        )
      })}
    </Box>
    </>
  )
}

/* ---------- ParkingLot ---------- */

function ParkingLotSection() {
  const { items, addItem } = useParkingLot()
  const { showSnackbar } = useSnackbarContext()
  const [input, setInput] = useState('')
  const parkingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => parkingInputRef.current?.focus()
    window.addEventListener('focus-parking-input', handler)
    return () => window.removeEventListener('focus-parking-input', handler)
  }, [])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = input.trim()
        if (trimmed) {
          addItem(input)
          showSnackbar('success', 'Added to parking lot')
        }
        setInput('')
      }
    },
    [addItem, input, showSnackbar],
  )

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.parkingLot}>Parking Lot</SectionTitle>
    <Box sx={cardSx}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          placeholder="Quick thought..."
          fullWidth
          size="small"
          value={input}
          inputRef={parkingInputRef}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          slotProps={{
            input: {
              sx: {
                fontSize: '0.85rem',
                color: '#e6edf3',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
              },
            },
          }}
        />
        <Tooltip title="Add">
          <IconButton
            size="small"
            onClick={() => {
              const trimmed = input.trim()
              if (trimmed) {
                addItem(input)
                showSnackbar('success', 'Added to parking lot')
              }
              setInput('')
            }}
            sx={{ color: '#a78bfa' }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {items.length === 0 && (
        <Typography sx={{ color: '#484f58', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Capture stray thoughts here
        </Typography>
      )}
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            py: 0.6,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: item.color,
              mt: 0.8,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#e6edf3' }}>
              {item.content}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#484f58', fontFamily: MONO }}>
              {relativeTime(item.createdAt)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
    </>
  )
}

/* ========== MAIN PAGE ========== */

export default function Today() {
  const { tasks, trackedTaskId } = useTasks()
  const { projects, trackedProjectIds, incrementLinkVisits } = useProjects()

  const [name, setName] = useState(
    () => localStorage.getItem('userFullName') ?? '',
  )
  useEffect(() => {
    const onNameChange = () =>
      setName(localStorage.getItem('userFullName') ?? '')
    window.addEventListener(USER_NAME_CHANGED_EVENT, onNameChange)
    return () =>
      window.removeEventListener(USER_NAME_CHANGED_EVENT, onNameChange)
  }, [])

  const trackedTask = useMemo(
    () => (trackedTaskId ? tasks.find((t) => t.id === trackedTaskId) : undefined),
    [tasks, trackedTaskId],
  )

  const trackedProject = useMemo(
    () =>
      trackedTask?.projectID
        ? projects.find((p) => p.id === trackedTask.projectID)
        : undefined,
    [projects, trackedTask],
  )

  const trackedProjects = useMemo(
    () => projects.filter((p) => trackedProjectIds.includes(p.id)),
    [projects, trackedProjectIds],
  )

  const completedToday = useMemo(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const ts = startOfDay.getTime()
    return tasks.filter(
      (t) => t.completedOn != null && t.completedOn >= ts,
    ).length
  }, [tasks])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 3,
        bgcolor: '#0d1117',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <HeaderBar name={name} />
      <MomentumBar count={completedToday} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <Box>
          {trackedTask && (
            <FocusCard task={trackedTask} project={trackedProject} />
          )}
          <TodaysPlan />
          <TrackedProjectsSection tasks={tasks} />
        </Box>

        {/* Right column */}
        <Box>
          <BlockerQuestionStats projects={trackedProjects} />
          <ContextLinks projects={trackedProjects} incrementLinkVisits={incrementLinkVisits} />
          <ParkingLotSection />
        </Box>
      </Box>
    </Box>
  )
}

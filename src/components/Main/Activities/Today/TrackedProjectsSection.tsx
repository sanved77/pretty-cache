import { useState, useEffect, useMemo } from 'react'
import { Box, Typography, LinearProgress, Chip, IconButton, Tooltip } from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import HelpOutline from '@mui/icons-material/HelpOutline'
import PushPin from '@mui/icons-material/PushPin'
import { NavLink } from 'react-router-dom'
import { useBlockers } from '../../../../hooks/useBlockers'
import { readTrackedProjectsSnapshot } from '../../../../utils/trackedProjectsSnapshot'
import { getProjectColor } from '../../../../utils/projectColor'
import { getProjectCompletion } from '../../../../utils/projectCompletion'
import { formatProjectDeadlineRemaining } from '../../../../utils/projectDeadlineRemaining'
import SectionTitle from '../../../shared/SectionTitle'
import { cardSx } from '../../../../styles/cardSx'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'
import { MONO, STATUS_COLORS } from './constants'
import type { Task } from '../../../../types/projects'

export function TrackedProjectsSection({
  tasks,
  onBlockerClick,
  onQuestionClick,
  onUntrack,
}: {
  tasks: Task[]
  onBlockerClick: (projectId?: string) => void
  onQuestionClick: (projectId?: string) => void
  onUntrack: (projectId: string) => void
}) {
  const [trackedProjects, setTrackedProjects] = useState(readTrackedProjectsSnapshot)
  const { blockers: allBlockers } = useBlockers()

  useEffect(() => {
    const onUpdate = () => setTrackedProjects(readTrackedProjectsSnapshot())
    window.addEventListener('prettycache-projects-updated', onUpdate)
    return () => window.removeEventListener('prettycache-projects-updated', onUpdate)
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
        const nonArchivedTasks = tasks.filter((t) => !t.isArchived)
        const { completed, total } = getProjectCompletion(nonArchivedTasks, project.id, taskMap)
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
        const activeBlockers = project.blockers.filter((bid) => {
          const b = allBlockers.find((x) => x.id === bid)
          return b != null && b.dismissedOn == null
        }).length
        const color = getProjectColor(project.id)

        return (
          <Box
            key={project.id}
            component={NavLink}
            to={`/projects/${project.id}`}
            sx={{
              mb: 2,
              pb: 2,
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' },
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
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
                sx={{
                  color: '#e6edf3',
                  fontWeight: 600,
                  fontSize: '0.9rem',
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
              <Tooltip title="Untrack project">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onUntrack(project.id)
                  }}
                  sx={{
                    color: '#8b949e',
                    '&:hover': { color: '#f85149' },
                    p: 0.25,
                  }}
                >
                  <PushPin sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
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
                <Typography
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onBlockerClick(project.id)
                  }}
                  sx={{ fontSize: '0.7rem', color: '#f85149', display: 'flex', alignItems: 'center', gap: 0.3, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
                >
                  <ErrorOutline sx={{ fontSize: 15 }} />
                  {activeBlockers} blocker{activeBlockers > 1 ? 's' : ''}
                </Typography>
              )}
              {project.questions.length > 0 && (
                <Typography
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onQuestionClick(project.id)
                  }}
                  sx={{ fontSize: '0.7rem', color: '#d29922', display: 'flex', alignItems: 'center', gap: 0.3, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
                >
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

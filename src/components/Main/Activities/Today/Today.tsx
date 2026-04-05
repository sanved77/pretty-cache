import { useState, useEffect, useMemo } from 'react'
import { Box } from '@mui/material'
import { USER_NAME_CHANGED_EVENT } from '../../../../dev/prettyCacheStorage'
import { useTasks } from '../../../../hooks/useTasks'
import { useProjects } from '../../../../hooks/useProjects'
import { HeaderBar } from './HeaderBar'
import { MomentumBar } from './MomentumBar'
import { FocusCard } from './FocusCard'
import { TodaysPlan } from './TodaysPlan'
import { TrackedProjectsSection } from './TrackedProjectsSection'
import { BlockerQuestionStats } from './BlockerQuestionStats'
import { BlockersQuestionsModal, type ModalMode } from './BlockersQuestionsModal'
import { ContextLinks } from './ContextLinks'
import { ParkingLotSection } from './ParkingLotSection'
import { useSnackbarContext } from '../../../../contexts/useSnackbarContext'

export default function Today() {
  const { tasks, trackedTaskId } = useTasks()
  const { projects, trackedProjectIds, toggleTrackedProject, incrementLinkVisits } = useProjects()
  const { showSnackbar } = useSnackbarContext()

  const [modalMode, setModalMode] = useState<ModalMode | null>(null)

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

  const handleUntrack = (projectId: string) => {
    toggleTrackedProject(projectId)
    showSnackbar('success', 'Project untracked')
  }

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
          <TrackedProjectsSection
            tasks={tasks}
            onBlockerClick={() => setModalMode('blockers')}
            onQuestionClick={() => setModalMode('questions')}
            onUntrack={handleUntrack}
          />
        </Box>

        {/* Right column */}
        <Box>
          <BlockerQuestionStats
            projects={trackedProjects}
            onBlockerClick={() => setModalMode('blockers')}
            onQuestionClick={() => setModalMode('questions')}
          />
          <ContextLinks projects={trackedProjects} incrementLinkVisits={incrementLinkVisits} />
          <ParkingLotSection />
        </Box>
      </Box>

      {modalMode && (
        <BlockersQuestionsModal
          open
          mode={modalMode}
          projects={trackedProjects}
          onClose={() => setModalMode(null)}
        />
      )}
    </Box>
  )
}

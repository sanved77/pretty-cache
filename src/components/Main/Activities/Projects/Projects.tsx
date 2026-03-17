import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { useTasks } from '../../../../hooks/useTasks'
import { useProjects } from '../../../../hooks/useProjects'
import TasksPanel from './TasksPanel'
import BlockersSection from './BlockersSection'
import QuestionsSection from './QuestionsSection'
import LinksSection from './LinksSection'

export default function Projects() {
  const { tasks, setTaskComplete, addTask } = useTasks()
  const { projects, setBlockerDismissed } = useProjects()
  const selectedProjectId = projects[0]?.id ?? ''
  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId), [projects, selectedProjectId])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        backgroundColor: 'var(--scratchpad-editor-bg)',
        color: 'var(--scratchpad-text)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: '1 1 60%', minWidth: 0, overflow: 'hidden', p: 2, borderRight: '1px solid var(--scratchpad-separator)', display: 'flex', flexDirection: 'column' }}>
        {selectedProject ? (
          <>
            <Typography variant="h4" sx={{ color: 'var(--scratchpad-text)', fontWeight: 700, mb: 0.5 }}>
              {selectedProject.projectName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--scratchpad-text-muted)', mb: 2 }}>
              {selectedProject.description}
            </Typography>
          </>
        ) : null}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TasksPanel tasks={tasks} projectId={selectedProjectId} onTaskComplete={setTaskComplete} addTask={addTask} />
        </Box>
      </Box>
      <Box sx={{ flex: '0 0 40%', minWidth: 0, overflow: 'auto', p: 2 }}>
        {selectedProject ? (
          <>
            <BlockersSection blockers={selectedProject.blockers} onDismissBlocker={(i) => setBlockerDismissed(selectedProjectId, i)} />
            <QuestionsSection questions={selectedProject.questions} />
            <LinksSection links={selectedProject.links} />
          </>
        ) : null}
      </Box>
    </Box>
  )
}

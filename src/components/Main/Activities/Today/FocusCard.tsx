import { Box, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { getProjectColor } from '../../../../utils/projectColor'
import { cardSx } from '../../../../styles/cardSx'
import type { Task, Project } from '../../../../types/projects'

export function FocusCard({
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

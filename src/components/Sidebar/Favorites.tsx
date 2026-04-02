import { useEffect, useState } from 'react'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { getProjectColor } from '../../utils/projectColor'
import { readTrackedProjectsSnapshot } from '../../utils/trackedProjectsSnapshot'

export default function Favorites() {
  const [trackedProjects, setTrackedProjects] = useState(readTrackedProjectsSnapshot)

  useEffect(() => {
    const onUpdate = () => setTrackedProjects(readTrackedProjectsSnapshot())
    window.addEventListener('missioncontrol-projects-updated', onUpdate)
    return () => window.removeEventListener('missioncontrol-projects-updated', onUpdate)
  }, [])

  if (trackedProjects.length === 0) {
    return null
  }

  return (
    <>
      <Typography
        component="div"
        sx={{
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'var(--sidebar-text)',
          opacity: 0.8,
          mt: 3.5,
          mb: 1.5,
          px: 1.5,
        }}
      >
        TRACKED
      </Typography>
      <List disablePadding dense>
        {trackedProjects.map((project) => (
          <ListItemButton
            key={project.id}
            component={NavLink}
            to={`/projects/${project.id}`}
            sx={{
              borderRadius: 1,
              mb: 0,
              py: 0.5,
              color: 'var(--sidebar-heading)',
              '&:hover': {
                backgroundColor: 'var(--sidebar-selected-bg)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: getProjectColor(project.id),
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={project.projectName}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}

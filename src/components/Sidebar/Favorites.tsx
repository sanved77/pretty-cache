import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import { NavLink } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { useSnackbarContext } from '../../contexts/useSnackbarContext'
import type { LinkObj } from '../../types/projects'
import { getProjectColor } from '../../utils/projectColor'
import { readTrackedProjectsSnapshot } from '../../utils/trackedProjectsSnapshot'
import {
  readTrackedFavoriteLinksSnapshot,
  type TrackedFavoriteLinkRow,
} from '../../utils/trackedFavoriteLinksSnapshot'
import LinkAddDialog from '../Main/Activities/Projects/LinkAddDialog'
import LinkContextMenu from '../Main/Activities/Projects/LinkContextMenu'
import { openLink } from '../../utils/openLink'

const sectionHeadingSx = {
  fontSize: '0.65rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: 'var(--sidebar-text)',
  opacity: 0.8,
  mt: 3.5,
  mb: 1.5,
  px: 1.5,
} as const

function rowToLinkObj(row: TrackedFavoriteLinkRow): LinkObj {
  return {
    id: row.linkId,
    label: row.label,
    url: row.url,
    type: row.type,
    visits: row.visits ?? 0,
  }
}

export default function Favorites() {
  const {
    deleteLink,
    updateLink,
    toggleTrackedLink,
    incrementLinkVisits,
  } = useProjects()
  const { showSnackbar } = useSnackbarContext()

  const [trackedProjects, setTrackedProjects] = useState(readTrackedProjectsSnapshot)
  const [favoriteLinks, setFavoriteLinks] = useState(readTrackedFavoriteLinksSnapshot)

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    link: LinkObj
    projectId: string
  } | null>(null)
  const [editTarget, setEditTarget] = useState<{
    link: LinkObj
    projectId: string
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    link: LinkObj
    projectId: string
  } | null>(null)

  useEffect(() => {
    const onUpdate = () => {
      setTrackedProjects(readTrackedProjectsSnapshot())
      setFavoriteLinks(readTrackedFavoriteLinksSnapshot())
    }
    window.addEventListener('prettycache-projects-updated', onUpdate)
    return () => window.removeEventListener('prettycache-projects-updated', onUpdate)
  }, [])

  const handleCloseContextMenu = useCallback(() => setContextMenu(null), [])

  const handleFavoriteContextMenu = useCallback(
    (e: React.MouseEvent, row: TrackedFavoriteLinkRow) => {
      e.preventDefault()
      setContextMenu({
        mouseX: e.clientX,
        mouseY: e.clientY,
        link: rowToLinkObj(row),
        projectId: row.projectId,
      })
    },
    [],
  )

  const handleEditFromMenu = useCallback(() => {
    if (contextMenu) {
      setEditTarget({ link: contextMenu.link, projectId: contextMenu.projectId })
    }
  }, [contextMenu])

  const handleDeleteFromMenu = useCallback(() => {
    if (contextMenu) {
      setDeleteTarget({ link: contextMenu.link, projectId: contextMenu.projectId })
    }
  }, [contextMenu])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteLink(deleteTarget.projectId, deleteTarget.link.id)
      showSnackbar('success', 'Link deleted')
      setDeleteTarget(null)
    }
  }, [deleteLink, deleteTarget, showSnackbar])

  const handleDeleteCancel = useCallback(() => setDeleteTarget(null), [])

  const handleDeleteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') handleDeleteCancel()
      if (e.key === 'Enter') {
        e.preventDefault()
        handleDeleteConfirm()
      }
    },
    [handleDeleteCancel, handleDeleteConfirm],
  )

  if (trackedProjects.length === 0 && favoriteLinks.length === 0) {
    return null
  }

  return (
    <>
      {trackedProjects.length > 0 && (
        <>
          <Typography component="div" sx={sectionHeadingSx}>
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
      )}

      {favoriteLinks.length > 0 && (
        <>
          <Typography component="div" sx={sectionHeadingSx}>
            FAVORITE LINKS
          </Typography>
          <List disablePadding dense>
            {favoriteLinks.map((row) => (
              <ListItemButton
                key={row.linkId}
                component="a"
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  openLink(row.linkId, row.url, incrementLinkVisits)
                }}
                onContextMenu={(e) => handleFavoriteContextMenu(e, row)}
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
                <ListItemIcon sx={{ minWidth: 32, color: 'var(--sidebar-text-muted)' }}>
                  <LinkIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={row.label}
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      <LinkAddDialog
        key={editTarget?.link.id ?? 'sidebar-edit'}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        {...(editTarget
          ? {
              linkId: editTarget.link.id,
              initialLabel: editTarget.link.label,
              initialUrl: editTarget.link.url,
              initialType: editTarget.link.type ?? 'Docs',
              onSave: (id, update) => {
                updateLink(editTarget.projectId, id, update)
                showSnackbar('success', 'Link updated')
                setEditTarget(null)
              },
            }
          : {})}
      />

      <LinkContextMenu
        open={contextMenu !== null}
        contextMenu={contextMenu}
        visitCount={contextMenu?.link.visits ?? 0}
        onClose={handleCloseContextMenu}
        onEdit={handleEditFromMenu}
        onDelete={handleDeleteFromMenu}
        isFavorite={
          contextMenu != null &&
          favoriteLinks.some((r) => r.linkId === contextMenu.link.id)
        }
        onFavoriteToggle={() => {
          if (contextMenu != null) {
            toggleTrackedLink(contextMenu.link.id)
          }
        }}
      />

      <Dialog
        open={deleteTarget !== null}
        onClose={handleDeleteCancel}
        onKeyDown={handleDeleteKeyDown}
        aria-labelledby="favorites-delete-link-dialog-title"
      >
        <DialogTitle id="favorites-delete-link-dialog-title">Delete Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{deleteTarget?.link.label}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { useMemo } from 'react'
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import HelpOutline from '@mui/icons-material/HelpOutline'
import Close from '@mui/icons-material/Close'
import { useBlockers } from '../../../../hooks/useBlockers'
import { useQuestions } from '../../../../hooks/useQuestions'
import { MONO } from './constants'
import type { Project } from '../../../../types/projects'

export type ModalMode = 'blockers' | 'questions'

interface BlockersQuestionsModalProps {
  open: boolean
  mode: ModalMode
  projects: Project[]
  onClose: () => void
}

export function BlockersQuestionsModal({ open, mode, projects, onClose }: BlockersQuestionsModalProps) {
  const { blockers: allBlockers } = useBlockers()
  const { questions: allQuestions } = useQuestions()

  const items = useMemo(() => {
    if (mode === 'blockers') {
      return projects.flatMap((p) =>
        p.blockers
          .map((bid) => allBlockers.find((b) => b.id === bid))
          .filter((b): b is NonNullable<typeof b> => b != null && b.dismissedOn == null)
          .map((b) => ({ ...b, projectName: p.projectName, projectId: p.id })),
      )
    }
    return projects.flatMap((p) =>
      p.questions
        .map((qid) => allQuestions.find((q) => q.id === qid))
        .filter((q): q is NonNullable<typeof q> => q != null && q.resolvedOn == null)
        .map((q) => ({ ...q, projectName: p.projectName, projectId: p.id })),
    )
  }, [mode, projects, allBlockers, allQuestions])

  const isBlockers = mode === 'blockers'
  const accentColor = isBlockers ? '#f85149' : '#d29922'
  const title = isBlockers ? 'Active Blockers' : 'Open Questions'
  const Icon = isBlockers ? ErrorOutline : HelpOutline

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#161b22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            minWidth: 480,
            maxWidth: 560,
            fontFamily: MONO,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          pt: 2.5,
          px: 2.5,
          color: accentColor,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontFamily: MONO,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon sx={{ fontSize: 18, color: accentColor }} />
          {title}
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: '#8b949e', '&:hover': { color: '#e6edf3' } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
        {items.length === 0 ? (
          <Typography sx={{ color: '#484f58', fontSize: '0.82rem', fontStyle: 'italic', py: 1 }}>
            No {isBlockers ? 'active blockers' : 'open questions'} across tracked projects
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={
                  isBlockers
                    ? {
                        bgcolor: 'rgba(248, 81, 73, 0.08)',
                        border: '1px solid rgba(248, 81, 73, 0.2)',
                        borderRadius: '6px',
                        p: 1.5,
                        mb: 0.75,
                      }
                    : {
                        borderLeft: '3px solid #FB923C',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        borderRadius: '0 6px 6px 0',
                        p: 1.5,
                        mb: 0.75,
                      }
                }
              >
                <Typography sx={{ fontSize: '0.85rem', color: '#e6edf3', mb: 0.5, lineHeight: 1.4 }}>
                  {item.text}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#8b949e', fontFamily: MONO }}>
                  {item.projectName}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

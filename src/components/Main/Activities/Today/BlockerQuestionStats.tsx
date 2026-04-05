import { Box, Typography } from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import HelpOutline from '@mui/icons-material/HelpOutline'
import { useBlockers } from '../../../../hooks/useBlockers'
import { cardSx } from '../../../../styles/cardSx'
import { MONO } from './constants'
import type { Project } from '../../../../types/projects'

export function BlockerQuestionStats({
  projects,
  onBlockerClick,
  onQuestionClick,
}: {
  projects: Project[]
  onBlockerClick: () => void
  onQuestionClick: () => void
}) {
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
        onClick={onBlockerClick}
        sx={{
          ...cardSx,
          mb: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
          cursor: 'pointer',
          '&:hover': { borderColor: 'rgba(248,81,73,0.3)', bgcolor: 'rgba(248,81,73,0.04)' },
          transition: 'border-color 0.15s, background-color 0.15s',
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
        onClick={onQuestionClick}
        sx={{
          ...cardSx,
          mb: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: 2,
          cursor: 'pointer',
          '&:hover': { borderColor: 'rgba(210,153,34,0.3)', bgcolor: 'rgba(210,153,34,0.04)' },
          transition: 'border-color 0.15s, background-color 0.15s',
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

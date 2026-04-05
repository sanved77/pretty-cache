import { Box, Typography } from '@mui/material'
import { MONO } from './constants'
import { cardSx } from '../../../../styles/cardSx'

export function MomentumBar({ count }: { count: number }) {
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

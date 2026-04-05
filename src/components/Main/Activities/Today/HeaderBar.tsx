import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { MONO } from './constants'
import { getGreeting, getTimeHint, getDayProgress, formatClock } from './utils'
import { DayProgressRing } from './DayProgressRing'

export function HeaderBar({ name }: { name: string }) {
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

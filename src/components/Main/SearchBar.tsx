import { Box, TextField } from '@mui/material'
import { useLocation } from 'react-router-dom'

const SEARCHBAR_HEIGHT = 65

export default function SearchBar() {
  const isTodayPage = useLocation().pathname === '/'

  return (
    <Box
      sx={{
        height: SEARCHBAR_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        justifyContent: 'center',
        backgroundColor: isTodayPage ? '#0d1117' : 'var(--projects-bg)',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          pt: 0.75,
        }}
      >
        <TextField
          fullWidth
          placeholder="Quick Capture: Add a task, note, or link instantly..."
          variant="outlined"
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <Box
                component="span"
                sx={{
                  fontFamily: '"SF Mono", Consolas, Monaco, monospace',
                  fontSize: 13,
                  color: isTodayPage ? '#8b949e' : 'var(--scratchpad-text-muted)',
                  backgroundColor: isTodayPage ? '#21262d' : 'var(--searchbar-shortcut-bg)',
                  borderRadius: 3,
                  px: 1,
                  py: 0.25,
                  m: 1.5,
                }}
                >
                  Cmd+K
                </Box>
              ),
              sx: {
                bgcolor: isTodayPage ? '#161b22' : 'var(--tasks-panel-bg)',
                borderRadius: 9999,
                '& fieldset': { border: 'none' },
                '& input': {
                  color: isTodayPage ? '#e6edf3' : 'var(--scratchpad-text)',
                  py: 1.25,
                  '&::placeholder': {
                    color: isTodayPage ? '#484f58' : 'var(--scratchpad-text-muted)',
                    opacity: 1,
                  },
                },
              },
            },
          }}
        />
      </Box>
    </Box>
  )
}

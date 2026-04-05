import { useState, useEffect, useRef } from 'react'
import { Box, TextField } from '@mui/material'
import { APP_FONT_FAMILY } from '../../styles/appFont'
import {
  isSeeding,
  SEEDING_CHANGED_EVENT,
} from '../../search/SearchIndexManager'
import { OPEN_COMMAND_PALETTE_EVENT } from '../CommandPalette/CommandPalette'

const SEARCHBAR_HEIGHT = 65
const SPINNER_FRAMES = ['|', '/', '—', '\\']

export default function SearchBar() {
  const [seeding, setSeeding] = useState(() => isSeeding())
  const [frame, setFrame] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const handler = () => setSeeding(isSeeding())
    window.addEventListener(SEEDING_CHANGED_EVENT, handler)
    return () => window.removeEventListener(SEEDING_CHANGED_EVENT, handler)
  }, [])

  useEffect(() => {
    if (seeding) {
      intervalRef.current = setInterval(() => {
        setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length)
      }, 80)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setFrame(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [seeding])

  const placeholder = seeding
    ? `${SPINNER_FRAMES[frame]}  Building index...`
    : 'Search or jump to...'

  return (
    <Box
      sx={{
        height: SEARCHBAR_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        justifyContent: 'center',
        backgroundColor: 'var(--projects-bg)',
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
          placeholder={placeholder}
          variant="outlined"
          size="small"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(OPEN_COMMAND_PALETTE_EVENT))
          }
          slotProps={{
            input: {
              readOnly: true,
              startAdornment: (
                <Box
                  component="span"
                  sx={{
                    fontFamily: APP_FONT_FAMILY,
                    fontSize: 13,
                    color: 'var(--scratchpad-text-muted)',
                    backgroundColor: 'var(--searchbar-shortcut-bg)',
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
                bgcolor: 'var(--tasks-panel-bg)',
                borderRadius: 9999,
                cursor: 'pointer',
                '& fieldset': { border: 'none' },
                '& input': {
                  color: 'var(--scratchpad-text)',
                  py: 1.25,
                  cursor: 'pointer',
                  fontFamily: seeding ? 'monospace' : 'inherit',
                  '&::placeholder': {
                    color: 'var(--scratchpad-text-muted)',
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

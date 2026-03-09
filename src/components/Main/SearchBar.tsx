import { Box, TextField } from '@mui/material'
import Bolt from '@mui/icons-material/Bolt'

const SEARCHBAR_HEIGHT = 65

export default function SearchBar() {
  return (
    <Box
      sx={{
        height: SEARCHBAR_HEIGHT,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        justifyContent: 'center',
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
                  color: '#A0A0A0',
                  backgroundColor: '#363d48',
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
                bgcolor: '#282D38',
                borderRadius: 9999,
                '& fieldset': { border: 'none' },
                '& input': {
                  color: '#E0E0E0',
                  py: 1.25,
                  '&::placeholder': {
                    color: '#A0A0A0',
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

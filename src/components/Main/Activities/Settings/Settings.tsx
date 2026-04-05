import { useCallback, useRef, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import {
  USER_FULL_NAME_KEY,
  USER_NAME_CHANGED_EVENT,
  downloadPrettyCacheExport,
  validatePrettyCacheImport,
  applyPrettyCacheImport,
} from '../../../../dev/prettyCacheStorage'
import { cardSx } from '../../../../styles/cardSx'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'
import SectionTitle from '../../../shared/SectionTitle'
import { useSnackbarContext } from '../../../../contexts/useSnackbarContext'

export default function Settings() {
  const { showSnackbar } = useSnackbarContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(
    () => localStorage.getItem(USER_FULL_NAME_KEY) ?? '',
  )

  const persistName = useCallback(() => {
    const trimmed = name.trim()
    localStorage.setItem(USER_FULL_NAME_KEY, trimmed)
    window.dispatchEvent(new CustomEvent(USER_NAME_CHANGED_EVENT))
  }, [name])

  const handleExport = () => {
    try {
      downloadPrettyCacheExport()
      showSnackbar('success', 'Export downloaded')
    } catch {
      showSnackbar('error', 'Export failed')
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as unknown
        const result = validatePrettyCacheImport(parsed)
        if (!result.ok) {
          showSnackbar('error', result.error)
          return
        }
        applyPrettyCacheImport(result.data)
      } catch {
        showSnackbar('error', 'Could not read or parse the file')
      }
    }
    reader.onerror = () => {
      showSnackbar('error', 'Could not read the file')
    }
    reader.readAsText(file)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        p: 3,
        bgcolor: 'var(--main-content-bg)',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="h5"
        sx={{ color: 'var(--scratchpad-text)', mb: 3, fontWeight: 600 }}
      >
        Settings
      </Typography>

      <Box sx={cardSx}>
        <SectionTitle color={SECTION_HEADER_COLORS.allProjectsHome}>Your name</SectionTitle>
        <Typography sx={{ color: 'var(--scratchpad-text-muted)', mb: 2, fontSize: '0.875rem' }}>
          Used in the Today greeting. Stored locally in this browser.
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Full name"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          onBlur={persistName}
          sx={{
            maxWidth: 400,
            '& .MuiOutlinedInput-root': { color: 'var(--scratchpad-text)' },
            '& .MuiInputLabel-root': { color: 'var(--scratchpad-text-muted)' },
          }}
        />
      </Box>

      <Box sx={cardSx}>
        <SectionTitle color={SECTION_HEADER_COLORS.allProjectsHome}>Data</SectionTitle>
        <Typography sx={{ color: 'var(--scratchpad-text-muted)', mb: 2, fontSize: '0.875rem' }}>
          Export or import all PrettyCache data for this browser (projects, tasks, logs,
          preferences, and more).
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <Button variant="contained" onClick={handleExport}>
            Export data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
          >
            Import data
          </Button>
        </Box>
        <Typography sx={{ color: '#8b949e', fontSize: '0.75rem', mt: 2 }}>
          Import replaces stored data for this site and reloads the page. Use a file exported
          from this app (version 1).
        </Typography>
      </Box>
    </Box>
  )
}

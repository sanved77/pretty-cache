import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react'
import { Box, Typography, TextField, IconButton, Tooltip } from '@mui/material'
import Add from '@mui/icons-material/Add'
import { useParkingLot } from '../../../../hooks/useParkingLot'
import { useSnackbarContext } from '../../../../contexts/useSnackbarContext'
import SectionTitle from '../../../shared/SectionTitle'
import { cardSx } from '../../../../styles/cardSx'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'
import { MONO } from './constants'
import { relativeTime } from './utils'

export function ParkingLotSection() {
  const { items, addItem } = useParkingLot()
  const { showSnackbar } = useSnackbarContext()
  const [input, setInput] = useState('')
  const parkingInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => parkingInputRef.current?.focus()
    window.addEventListener('focus-parking-input', handler)
    return () => window.removeEventListener('focus-parking-input', handler)
  }, [])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = input.trim()
        if (trimmed) {
          addItem(input)
          showSnackbar('success', 'Added to parking lot')
        }
        setInput('')
      }
    },
    [addItem, input, showSnackbar],
  )

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.parkingLot}>Parking Lot</SectionTitle>
    <Box sx={cardSx}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          placeholder="Quick thought..."
          fullWidth
          size="small"
          value={input}
          inputRef={parkingInputRef}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          slotProps={{
            input: {
              sx: {
                fontSize: '0.85rem',
                color: '#e6edf3',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
              },
            },
          }}
        />
        <Tooltip title="Add">
          <IconButton
            size="small"
            onClick={() => {
              const trimmed = input.trim()
              if (trimmed) {
                addItem(input)
                showSnackbar('success', 'Added to parking lot')
              }
              setInput('')
            }}
            sx={{ color: '#a78bfa' }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {items.length === 0 && (
        <Typography sx={{ color: '#484f58', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Capture stray thoughts here
        </Typography>
      )}
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            py: 0.6,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: item.color,
              mt: 0.8,
              flexShrink: 0,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#e6edf3' }}>
              {item.content}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#484f58', fontFamily: MONO }}>
              {relativeTime(item.createdAt)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
    </>
  )
}

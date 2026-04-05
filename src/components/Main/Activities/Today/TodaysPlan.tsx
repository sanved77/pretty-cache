import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react'
import { Box, Typography, TextField, Checkbox, IconButton } from '@mui/material'
import Close from '@mui/icons-material/Close'
import { useToday } from '../../../../hooks/useToday'
import { useSnackbarContext } from '../../../../contexts/useSnackbarContext'
import SectionTitle from '../../../shared/SectionTitle'
import { cardSx } from '../../../../styles/cardSx'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'

export function TodaysPlan() {
  const { items, addItem, toggleItem, removeItem } = useToday()
  const { showSnackbar } = useSnackbarContext()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    window.addEventListener('focus-today-input', handler)
    return () => window.removeEventListener('focus-today-input', handler)
  }, [])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const trimmed = input.trim()
        if (trimmed) {
          addItem(input)
          showSnackbar('success', "Added to today's plan")
        }
        setInput('')
      }
    },
    [addItem, input, showSnackbar],
  )

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.todaysPlan}>Today&apos;s Plan</SectionTitle>
    <Box sx={cardSx}>
      <TextField
        placeholder="Add an item..."
        fullWidth
        size="small"
        value={input}
        inputRef={inputRef}
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
        sx={{ mb: 1.5 }}
      />
      {items.length === 0 && (
        <Typography sx={{ color: '#484f58', fontSize: '0.8rem', fontStyle: 'italic' }}>
          No items yet — add your goals for today
        </Typography>
      )}
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            py: 0.25,
            '& .delete-btn': { visibility: 'hidden' },
            '&:hover .delete-btn': { visibility: 'visible' },
          }}
        >
          <Checkbox
            checked={item.status === 'done'}
            onChange={() => toggleItem(item.id)}
            size="small"
            sx={{ color: '#30363d', '&.Mui-checked': { color: '#22c55e' }, p: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: item.status === 'done' ? '#484f58' : '#e6edf3',
              textDecoration: item.status === 'done' ? 'line-through' : 'none',
              flex: 1,
            }}
          >
            {item.content}
          </Typography>
          <IconButton
            className="delete-btn"
            size="small"
            onClick={() => removeItem(item.id)}
            sx={{ color: '#484f58', '&:hover': { color: '#f85149' }, p: 0.25 }}
          >
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
    </>
  )
}

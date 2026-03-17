import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, TextField } from '@mui/material'
import Add from '@mui/icons-material/Add'

export interface AddTaskInputProps {
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  indentLevel?: number
  centerRow?: boolean
}

export default function AddTaskInput({
  onSubmit,
  onCancel,
  placeholder = 'New task…',
  indentLevel = 0,
  centerRow = false,
}: AddTaskInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onSubmit(trimmed)
      setValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: centerRow ? 0 : indentLevel * 3,
        mb: 0.5,
        justifyContent: centerRow ? 'center' : 'flex-start',
      }}
    >
      <TextField
        inputRef={inputRef}
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          flex: centerRow ? '0 1 auto' : 1,
          minWidth: 0,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'var(--scratchpad-toolbar-bg)',
            color: 'var(--scratchpad-text)',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'var(--scratchpad-separator)' },
            '&:hover fieldset': { borderColor: 'var(--scratchpad-text-muted)' },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'var(--scratchpad-text-muted)',
            opacity: 1,
          },
        }}
        inputProps={{ 'aria-label': 'New task content' }}
      />
      <IconButton
        size="small"
        onClick={handleSubmit}
        sx={{ color: 'var(--scratchpad-text-muted)', p: 0.5 }}
        aria-label="Add task"
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  )
}

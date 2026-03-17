import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, TextField } from '@mui/material'
import Add from '@mui/icons-material/Add'
import Check from '@mui/icons-material/Check'

export interface AddTaskInputProps {
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  indentLevel?: number
  centerRow?: boolean
  initialValue?: string
  mode?: 'add' | 'edit'
  inline?: boolean
  variant?: 'scratchpad' | 'projects'
}

export default function AddTaskInput({
  onSubmit,
  onCancel,
  placeholder = 'New task…',
  indentLevel = 0,
  centerRow = false,
  initialValue,
  mode: modeProp,
  inline = false,
  variant = 'scratchpad',
}: AddTaskInputProps) {
  const resolvedMode = modeProp ?? (initialValue != null && initialValue !== '' ? 'edit' : 'add')
  const [value, setValue] = useState(initialValue ?? '')
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

  const isProjects = variant === 'projects'

  const textFieldSx = {
    flex: centerRow ? '0 1 auto' : 1,
    minWidth: 0,
    ...(isProjects
      ? {
          '& .MuiOutlinedInput-root': {
            bgcolor: 'var(--scratchpad-toolbar-bg)',
            color: 'var(--scratchpad-text)',
            fontSize: '0.875rem',
            '& fieldset': { borderColor: 'var(--scratchpad-separator)' },
            '&:hover fieldset': { borderColor: 'var(--projects-metric-color)' },
            '&.Mui-focused fieldset': { borderColor: 'var(--projects-metric-color)', borderWidth: 1 },
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'var(--scratchpad-text-muted)',
            opacity: 1,
          },
        }
      : {
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
        }),
  }

  const actionButtonSx = isProjects
    ? {
        color: '#ffffff',
        p: 0.25,
        bgcolor: 'var(--projects-metric-color)',
        '&:hover': {
          bgcolor: 'var(--projects-metric-color)',
        },
        borderRadius: '4px',
      }
    : { color: 'var(--scratchpad-text-muted)', p: 0.5 }

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: inline ? 0 : centerRow ? 0 : indentLevel * 3,
        mb: inline ? 0 : 0.5,
        flex: inline ? 1 : undefined,
        minWidth: inline ? 0 : undefined,
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
        sx={textFieldSx}
        inputProps={{
          'aria-label': resolvedMode === 'edit' ? 'Edit task content' : 'New task content',
        }}
      />
      <IconButton
        size="small"
        onClick={handleSubmit}
        sx={actionButtonSx}
        aria-label={resolvedMode === 'edit' ? 'Save edit' : 'Add task'}
      >
        {resolvedMode === 'edit' ? (
          <Check sx={{ fontSize: 18 }} />
        ) : (
          <Add fontSize="small" />
        )}
      </IconButton>
    </Box>
  )
}

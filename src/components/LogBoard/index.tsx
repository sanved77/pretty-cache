import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactElement,
} from 'react'
import { Box, TextField, IconButton, Snackbar } from '@mui/material'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import { ACTION_COLORS, type LogEntry } from '../../types/logs'

const LOGS_KEY = 'logs'

function readLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLogs(logs: LogEntry[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
  window.dispatchEvent(new CustomEvent('missioncontrol-logs-updated'))
}

function LogHeader({
  selectedDate,
  onPrev,
  onNext,
}: {
  selectedDate: dayjs.Dayjs
  onPrev: () => void
  onNext: () => void
}) {
  const isToday = selectedDate.isSame(dayjs(), 'day')
  const [snackOpen, setSnackOpen] = useState(false)

  return (
    <>
      <Box sx={{ mb: '20px' }}>
        {/* Row 1: Title + today badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', mb: '12px' }}>
          <Box sx={{ fontSize: '20px', fontWeight: 600, color: '#e6edf3' }}>Daily log</Box>
          {isToday && (
            <Box
              sx={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#58a6ff',
                background: 'rgba(31, 111, 235, 0.13)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              today
            </Box>
          )}
        </Box>
        {/* Row 2: Summary button + date navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            component="button"
            onClick={() => {
              // TODO: generate daily summary
              setSnackOpen(true)
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(227, 179, 65, 0.27)',
              background: 'rgba(227, 179, 65, 0.07)',
              color: '#e3b341',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                background: 'rgba(227, 179, 65, 0.13)',
                borderColor: 'rgba(227, 179, 65, 0.4)',
              },
            }}
          >
            <AutoAwesome sx={{ fontSize: '14px', color: '#e3b341' }} />
            Summary
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconButton
              onClick={onPrev}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                border: '1px solid #1e2a3a',
                background: '#161b22',
                color: '#8b949e',
                '&:hover': { borderColor: '#30363d', color: '#c9d1d9' },
              }}
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </IconButton>
            <Box sx={{ fontSize: '13px', color: '#8b949e', fontWeight: 500, minWidth: '80px', textAlign: 'center' }}>
              {selectedDate.format('ddd, MMM D')}
            </Box>
            <IconButton
              onClick={onNext}
              disabled={isToday}
              sx={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                border: '1px solid #1e2a3a',
                background: '#161b22',
                color: '#8b949e',
                opacity: isToday ? 0.3 : 1,
                cursor: isToday ? 'default' : 'pointer',
                '&:hover': isToday ? {} : { borderColor: '#30363d', color: '#c9d1d9' },
              }}
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        message="Summary coming soon"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}

function LogInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    window.addEventListener('focus-log-input', handler)
    return () => window.removeEventListener('focus-log-input', handler)
  }, [])

  return (
    <TextField
      fullWidth
      placeholder="What are you working on right now..."
      value={value}
      inputRef={inputRef}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && value.trim()) {
          onSubmit(value.trim())
          setValue('')
        }
      }}
      sx={{
        mb: '20px',
        '& .MuiOutlinedInput-root': {
          background: '#0d1117',
          border: '1px solid #1e2a3a',
          borderRadius: '6px',
          color: '#c9d1d9',
          fontSize: '13px',
          fontFamily: 'inherit',
          '& fieldset': { border: 'none' },
          '&:hover': { borderColor: '#30363d' },
          '&.Mui-focused': { borderColor: '#30363d' },
        },
        '& .MuiOutlinedInput-input': {
          padding: '10px 14px',
          '&::placeholder': { color: '#484f58', opacity: 1 },
        },
      }}
    />
  )
}

function DaySeparator({ date }: { date: dayjs.Dayjs }) {
  const isYesterday = date.isSame(dayjs().subtract(1, 'day'), 'day')
  const label = isYesterday
    ? `Yesterday — ${date.format('ddd, MMM D')}`
    : date.format('ddd, MMM D')

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: '18px 0 12px -24px',
      }}
    >
      <Box
        sx={{
          width: 11,
          height: 11,
          borderRadius: '50%',
          border: '2px solid #30363d',
          background: '#0d1117',
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#484f58',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
      <Box sx={{ flex: 1, height: '1px', background: '#1e2a3a' }} />
    </Box>
  )
}

function LogEntryRow({
  entry,
  onDelete,
}: {
  entry: LogEntry
  onDelete: (id: string) => void
}) {
  const isManual = entry.action === 'Manual'
  const dotColor = ACTION_COLORS[entry.action] ?? '#58a6ff'
  const actionColor = ACTION_COLORS[entry.action] ?? '#8b949e'

  return (
    <Box
      sx={{
        position: 'relative',
        mb: '2px',
        padding: '8px 14px 8px 16px',
        borderRadius: '6px',
        transition: 'background 0.12s',
        '&:hover': { background: 'rgba(22, 27, 34, 0.4)' },
        '&:hover .log-hover-actions': { opacity: 1 },
      }}
    >
      {/* Timeline dot */}
      <Box
        sx={{
          position: 'absolute',
          left: -24,
          top: 14,
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: dotColor,
          transform: 'translateX(0.5px)',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Time */}
        <Box
          sx={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#484f58',
            minWidth: 58,
            flexShrink: 0,
            pt: '1px',
          }}
        >
          {dayjs(entry.timestamp).format('h:mm A')}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, lineHeight: 1.5 }}>
          {isManual ? (
            <Box sx={{ fontSize: '13px', color: '#c9d1d9' }}>
              {entry.content}
            </Box>
          ) : (
            <Box sx={{ fontSize: '12px', color: '#c9d1d9', fontWeight: 500 }}>
              <Box
                component="span"
                sx={{ color: actionColor, fontWeight: 600, mr: '6px' }}
              >
                {entry.action}
              </Box>
              {entry.content}
            </Box>
          )}
        </Box>
      </Box>

      {/* Hover actions — manual entries only */}
      {isManual && (
        <Box
          className="log-hover-actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 10,
            display: 'flex',
            gap: '4px',
            opacity: 0,
            transition: 'opacity 0.12s',
          }}
        >
          <IconButton
            size="small"
            // TODO: implement edit
            sx={{
              width: 22,
              height: 22,
              borderRadius: '4px',
              border: '1px solid #1e2a3a',
              background: '#161b22',
              color: '#8b949e',
              '&:hover': { borderColor: '#30363d', color: '#c9d1d9' },
            }}
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(entry.id)}
            sx={{
              width: 22,
              height: 22,
              borderRadius: '4px',
              border: '1px solid #1e2a3a',
              background: '#161b22',
              color: '#8b949e',
              '&:hover': { borderColor: '#30363d', color: '#c9d1d9' },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

function LogTimeline({
  logs,
  selectedDate,
  onDelete,
}: {
  logs: LogEntry[]
  selectedDate: dayjs.Dayjs
  onDelete: (id: string) => void
}) {
  const filteredLogs = useMemo(() => {
    return logs.filter((entry) => {
      const entryDay = dayjs(entry.timestamp)
      return entryDay.isSame(selectedDate, 'day') || entryDay.isBefore(selectedDate, 'day')
    })
  }, [logs, selectedDate])

  const isToday = selectedDate.isSame(dayjs(), 'day')

  if (filteredLogs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', fontSize: '13px', color: '#484f58', padding: '40px 0' }}>
        {isToday ? 'No activity yet today. Start logging!' : 'No activity on this day.'}
      </Box>
    )
  }

  const elements: ReactElement[] = []
  let lastDateStr: string | null = null

  for (const entry of filteredLogs) {
    const entryDateStr = dayjs(entry.timestamp).format('YYYY-MM-DD')
    if (lastDateStr !== null && entryDateStr !== lastDateStr) {
      elements.push(
        <DaySeparator key={`sep-${entryDateStr}`} date={dayjs(entry.timestamp)} />
      )
    }
    lastDateStr = entryDateStr
    elements.push(
      <LogEntryRow key={entry.id} entry={entry} onDelete={onDelete} />
    )
  }

  return (
    <Box sx={{ position: 'relative', pl: '24px' }}>
      {/* Vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: '5px',
          top: 0,
          bottom: 0,
          width: '1px',
          background: '#1e2a3a',
        }}
      />
      {elements}
    </Box>
  )
}

export default function LogBoard() {
  const [logs, setLogs] = useState<LogEntry[]>(readLogs)
  const [selectedDate, setSelectedDate] = useState(dayjs())

  useEffect(() => {
    const handler = () => setLogs(readLogs())
    window.addEventListener('missioncontrol-logs-updated', handler)
    return () => window.removeEventListener('missioncontrol-logs-updated', handler)
  }, [])

  const handleManualEntry = useCallback((text: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action: 'Manual',
      content: text,
    }
    const updated = [entry, ...readLogs()]
    writeLogs(updated)
    setLogs(updated)
  }, [])

  const handleDelete = useCallback((id: string) => {
    const updated = readLogs().filter((e) => e.id !== id)
    writeLogs(updated)
    setLogs(updated)
  }, [])

  const goToPrev = useCallback(() => {
    setSelectedDate((prev) => prev.subtract(1, 'day'))
  }, [])

  const goToNext = useCallback(() => {
    setSelectedDate((prev) => {
      const next = prev.add(1, 'day')
      return next.isAfter(dayjs(), 'day') ? prev : next
    })
  }, [])

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'var(--logboard-bg)',
        p: '24px',
        boxSizing: 'border-box',
        overflow: 'auto',
        fontFamily: 'inherit',
      }}
    >
      <LogHeader selectedDate={selectedDate} onPrev={goToPrev} onNext={goToNext} />
      <LogInput onSubmit={handleManualEntry} />
      <LogTimeline logs={logs} selectedDate={selectedDate} onDelete={handleDelete} />
    </Box>
  )
}

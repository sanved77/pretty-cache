import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import EditNoteIcon from '@mui/icons-material/EditNote'
import FolderIcon from '@mui/icons-material/Folder'
import SettingsIcon from '@mui/icons-material/Settings'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddIcon from '@mui/icons-material/Add'
import ParkIcon from '@mui/icons-material/LocalParking'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import LinkIcon from '@mui/icons-material/Link'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import StarIcon from '@mui/icons-material/Star'
import { downloadPrettyCacheExport } from '../../dev/prettyCacheStorage'
import { getAll, type SearchIndexEntry } from '../../search/SearchIndexManager'

export const OPEN_COMMAND_PALETTE_EVENT = 'open-command-palette'

type GroupedResults = {
  label: string
  items: SearchIndexEntry[]
}

const ICON_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'page-today': { icon: <TodayIcon sx={{ fontSize: 14 }} />, color: '#58a6ff', bg: 'rgba(31,111,235,0.13)' },
  'page-daily-logs': { icon: <CalendarMonthIcon sx={{ fontSize: 14 }} />, color: '#58a6ff', bg: 'rgba(31,111,235,0.13)' },
  'page-scratchpad': { icon: <EditNoteIcon sx={{ fontSize: 14 }} />, color: '#bc8cff', bg: 'rgba(188,140,255,0.13)' },
  'page-projects': { icon: <FolderIcon sx={{ fontSize: 14 }} />, color: '#39d2c0', bg: 'rgba(57,210,192,0.13)' },
  'page-settings': { icon: <SettingsIcon sx={{ fontSize: 14 }} />, color: '#8b949e', bg: 'rgba(139,148,158,0.13)' },
  'action-create-project': { icon: <AddIcon sx={{ fontSize: 14 }} />, color: '#3fb950', bg: 'rgba(63,185,80,0.13)' },
  'action-add-daily-log': { icon: <CalendarMonthIcon sx={{ fontSize: 14 }} />, color: '#58a6ff', bg: 'rgba(88,166,255,0.13)' },
  'action-add-parking-lot': { icon: <ParkIcon sx={{ fontSize: 14 }} />, color: '#bc8cff', bg: 'rgba(188,140,255,0.13)' },
  'action-add-today-plan': { icon: <PlaylistAddIcon sx={{ fontSize: 14 }} />, color: '#e3b341', bg: 'rgba(227,179,65,0.13)' },
  'action-export-backup': { icon: <FileDownloadIcon sx={{ fontSize: 14 }} />, color: '#39d2c0', bg: 'rgba(57,210,192,0.13)' },
  'action-import': { icon: <FileUploadIcon sx={{ fontSize: 14 }} />, color: '#8b949e', bg: 'rgba(139,148,158,0.13)' },
}

function getTypeIcon(entry: SearchIndexEntry) {
  const specific = ICON_CONFIG[entry.id]
  if (specific) return specific

  switch (entry.type) {
    case 'project': return { icon: <StarIcon sx={{ fontSize: 14 }} />, color: '#e3b341', bg: 'rgba(227,179,65,0.13)' }
    case 'link': return { icon: <LinkIcon sx={{ fontSize: 14 }} />, color: '#39d2c0', bg: 'rgba(57,210,192,0.13)' }
    case 'task': return { icon: <TaskAltIcon sx={{ fontSize: 14 }} />, color: '#8b949e', bg: 'rgba(139,148,158,0.13)' }
    default: return { icon: <SearchIcon sx={{ fontSize: 14 }} />, color: '#8b949e', bg: 'rgba(139,148,158,0.13)' }
  }
}

function highlightMatch(text: string, query: string) {
  if (!query) return text
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return text
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.length)
  const after = text.slice(idx + query.length)
  return (
    <>
      {before}
      <mark style={{ background: 'none', color: '#58a6ff', fontWeight: 600 }}>{match}</mark>
      {after}
    </>
  )
}

const DAILY_LOG_ENTRY: SearchIndexEntry = {
  id: 'action-add-daily-log',
  type: 'action',
  content: 'Add a daily log',
}

const TYPE_ORDER = ['action', 'page', 'project', 'task', 'link'] as const
const GROUP_LABELS: Record<string, string> = {
  action: 'Actions',
  page: 'Pages',
  project: 'Projects',
  task: 'Tasks',
  link: 'Links',
}

function filterAndGroup(query: string): { flat: SearchIndexEntry[]; groups: GroupedResults[] } {
  const all = getAll()
  const q = query.toLowerCase().trim()

  let matched: SearchIndexEntry[]
  if (!q) {
    matched = all.filter((e) => e.type === 'page' || e.type === 'action')
  } else {
    matched = all.filter((e) => e.content.toLowerCase().includes(q))
  }

  const hasLog = q && 'log'.includes(q)
  const quickAction = hasLog ? [DAILY_LOG_ENTRY] : []
  const quickActionGroup: GroupedResults[] = quickAction.length
    ? [{ label: 'Quick Action', items: quickAction }]
    : []

  const groups: GroupedResults[] = [...quickActionGroup]
  let total = quickAction.length

  for (const type of TYPE_ORDER) {
    if (total >= 15) break
    const groupLabel = GROUP_LABELS[type]
    if (type === 'action' && hasLog) {
      const actionItems = matched.filter((e) => e.type === 'action' && e.id !== 'action-add-daily-log')
      if (actionItems.length > 0) {
        const slice = actionItems.slice(0, 15 - total)
        groups.push({ label: groupLabel, items: slice })
        total += slice.length
      }
      continue
    }
    const items = matched.filter((e) => e.type === type)
    if (items.length === 0) continue
    const slice = items.slice(0, 15 - total)
    groups.push({ label: groupLabel, items: slice })
    total += slice.length
  }

  const flat = groups.flatMap((g) => g.items)
  return { flat, groups }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const openPalette = useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
    setOpen(true)
  }, [])

  const closePalette = useCallback(() => {
    setQuery('')
    setOpen(false)
  }, [])

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => {
          if (prev) {
            setQuery('')
            return false
          }
          setQuery('')
          setSelectedIndex(0)
          return true
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Listen for open event from SearchBar
  useEffect(() => {
    const handler = () => openPalette()
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handler)
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handler)
  }, [openPalette])

  // Auto-focus input
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const { flat, groups } = useMemo(() => filterAndGroup(query), [query])

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const executeEntry = useCallback(
    (entry: SearchIndexEntry) => {
      closePalette()

      switch (entry.type) {
        case 'page':
          if (entry.route) navigate(entry.route)
          break
        case 'project':
          if (entry.route) navigate(entry.route)
          break
        case 'task':
          if (entry.route) navigate(entry.route)
          break
        case 'link':
          if (entry.hyperlink) window.open(entry.hyperlink, '_blank')
          break
        case 'action':
          handleAction(entry.id)
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, location.pathname],
  )

  const handleAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'action-create-project':
          navigate('/projects', { state: { openCreateProject: true } })
          break
        case 'action-add-daily-log':
          window.dispatchEvent(new CustomEvent('focus-log-input'))
          break
        case 'action-add-parking-lot':
          if (location.pathname !== '/') {
            navigate('/')
            setTimeout(() => window.dispatchEvent(new CustomEvent('focus-parking-input')), 150)
          } else {
            window.dispatchEvent(new CustomEvent('focus-parking-input'))
          }
          break
        case 'action-add-today-plan':
          if (location.pathname !== '/') {
            navigate('/')
            setTimeout(() => window.dispatchEvent(new CustomEvent('focus-today-input')), 150)
          } else {
            window.dispatchEvent(new CustomEvent('focus-today-input'))
          }
          break
        case 'action-export-backup':
          navigate('/settings')
          setTimeout(() => {
            try { downloadPrettyCacheExport() } catch { /* handled by Settings */ }
          }, 200)
          break
        case 'action-import':
          navigate('/settings')
          setTimeout(() => {
            const fileInput = document.querySelector<HTMLInputElement>('input[type=file][accept*=json]')
            fileInput?.click()
          }, 200)
          break
      }
    },
    [navigate, location.pathname],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        closePalette()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(flat.length, 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const entry = flat[selectedIndex]
        if (entry) executeEntry(entry)
        return
      }
    },
    [closePalette, flat, selectedIndex, executeEntry],
  )

  // Auto-scroll selected into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  let flatIndex = 0

  return createPortal(
    <Box
      onClick={closePalette}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '80px',
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: 560,
          maxHeight: 'calc(100vh - 120px)',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'flex-start',
        }}
      >
        {/* Input bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid #1e2a3a',
            gap: '10px',
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: '#8b949e', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#e6edf3',
              fontFamily: 'inherit',
            }}
          />
          <Box
            component="span"
            sx={{
              fontSize: 10,
              color: '#484f58',
              background: '#0d1117',
              border: '1px solid #1e2a3a',
              borderRadius: '4px',
              padding: '1px 5px',
              flexShrink: 0,
            }}
          >
            Esc
          </Box>
        </Box>

        {/* Results area */}
        <Box
          ref={listRef}
          sx={{
            padding: '6px 0',
            maxHeight: 360,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { background: '#30363d', borderRadius: 3 },
          }}
        >
          {query && flat.length === 0 ? (
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: 13,
                color: '#484f58',
                padding: '32px 0',
              }}
            >
              No results for &apos;{query}&apos;
            </Typography>
          ) : (
            groups.map((group) => (
              <Box key={group.label}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: '#484f58',
                    padding: '8px 10px 4px',
                  }}
                >
                  {group.label}
                </Typography>
                {group.items.map((entry) => {
                  const idx = flatIndex++
                  const isSelected = idx === selectedIndex
                  const iconCfg = getTypeIcon(entry)
                  return (
                    <Box
                      key={entry.id}
                      data-selected={isSelected}
                      onClick={() => executeEntry(entry)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 10px',
                        margin: '0 6px',
                        borderRadius: '6px',
                        gap: '10px',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'rgba(31, 111, 235, 0.13)'
                          : 'transparent',
                        '&:hover': {
                          background: isSelected
                            ? 'rgba(31, 111, 235, 0.13)'
                            : '#1e2a3a',
                        },
                      }}
                    >
                      {/* Icon box */}
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: iconCfg.color,
                          background: iconCfg.bg,
                        }}
                      >
                        {iconCfg.icon}
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#e6edf3',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {highlightMatch(entry.content, query)}
                        </Typography>
                        {entry.meta && (
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: '#484f58',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {entry.meta}
                          </Typography>
                        )}
                      </Box>

                      {/* Type badge */}
                      <Box
                        component="span"
                        sx={{
                          fontSize: 10,
                          color: '#484f58',
                          background: '#0d1117',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          flexShrink: 0,
                          textTransform: 'capitalize',
                        }}
                      >
                        {entry.type}
                      </Box>

                      {/* Chevron */}
                      <ChevronRightIcon
                        sx={{ fontSize: 14, color: '#30363d', flexShrink: 0 }}
                      />
                    </Box>
                  )
                })}
              </Box>
            ))
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '10px 16px',
            borderTop: '1px solid #1e2a3a',
          }}
        >
          {[
            { keys: ['↑', '↓'], label: 'navigate' },
            { keys: ['↵'], label: 'open' },
            { keys: ['esc'], label: 'close' },
          ].map(({ keys, label }) => (
            <Box
              key={label}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {keys.map((k) => (
                <Box
                  key={k}
                  component="span"
                  sx={{
                    fontSize: 10,
                    background: '#0d1117',
                    border: '1px solid #1e2a3a',
                    borderRadius: '3px',
                    padding: '0px 4px',
                    color: '#484f58',
                    lineHeight: '18px',
                  }}
                >
                  {k}
                </Box>
              ))}
              <Typography
                component="span"
                sx={{ fontSize: 11, color: '#484f58' }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>,
    document.body,
  )
}

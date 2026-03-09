import { Box, IconButton, Typography } from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import WrapText from '@mui/icons-material/WrapText'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import EditNote from '@mui/icons-material/EditNote'

export interface ToolbarProps {
  onCopy: () => void
  onClear: () => void
  onWordWrapToggle: () => void
  wordWrap: boolean
}

export default function Toolbar({ onCopy, onClear, onWordWrapToggle, wordWrap }: ToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--scratchpad-toolbar-bg)',
        color: 'var(--scratchpad-text)',
        px: 1.5,
        py: 1,
        borderBottom: '1px solid var(--scratchpad-separator)',
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EditNote sx={{ fontSize: 20, color: 'var(--scratchpad-text-muted)' }} />
        <Typography variant="subtitle1" sx={{ color: 'var(--scratchpad-text)', fontWeight: 600, fontSize: '1rem' }}>
          ScratchPad
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={onCopy}
          sx={{ color: 'var(--scratchpad-text-muted)' }}
          aria-label="Copy"
        >
          <ContentCopy fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={onWordWrapToggle}
          sx={{
            color: wordWrap ? 'var(--sidebar-accent)' : 'var(--scratchpad-text-muted)',
          }}
          aria-label="Toggle word wrap"
        >
          <WrapText fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={onClear}
          sx={{ color: 'var(--scratchpad-btn-clear)' }}
          aria-label="Clear"
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}

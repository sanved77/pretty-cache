import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { Box, Link, Typography } from '@mui/material'
import Code from '@mui/icons-material/Code'
import Description from '@mui/icons-material/Description'
import ShowChart from '@mui/icons-material/ShowChart'
import Palette from '@mui/icons-material/Palette'
import Build from '@mui/icons-material/Build'
import LinkIcon from '@mui/icons-material/Link'
import type { LinkObj } from '../../../../types/projects'

const TYPE_ICON_MAP: Record<string, ComponentType<{ sx?: object }>> = {
  Code: Code,
  Telemetry: ShowChart,
  Doc: Description,
  Design: Palette,
  Development: Build,
  Other: LinkIcon,
}

function getIconForType(type?: string) {
  if (!type) return LinkIcon
  return TYPE_ICON_MAP[type] ?? LinkIcon
}

export interface LinksSectionProps {
  links: LinkObj[]
}

export default function LinksSection({ links }: LinksSectionProps) {
  const sorted = useMemo(() => [...links].sort((a, b) => a.label.localeCompare(b.label)), [links])
  if (sorted.length === 0) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <LinkIcon sx={{ fontSize: 18, color: 'var(--scratchpad-text-muted)' }} />
        <Typography variant="subtitle2" sx={{ color: 'var(--scratchpad-text)', fontWeight: 600 }}>
          Context Links
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sorted.map((link, i) => {
          const Icon = getIconForType(link.type)
          return (
            <Link
              key={i}
              href={link.url}
              target="_blank"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: 'var(--scratchpad-toolbar-bg)',
                color: 'var(--scratchpad-text)',
                '&:hover': { bgcolor: 'var(--scratchpad-separator)' },
              }}
            >
              <Icon sx={{ fontSize: 18, color: 'var(--scratchpad-text-muted)' }} />
              <Typography variant="body2">{link.label}</Typography>
            </Link>
          )
        })}
      </Box>
    </Box>
  )
}

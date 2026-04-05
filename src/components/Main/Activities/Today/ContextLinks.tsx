import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { getLinkTypeConfig } from '../../../../utils/linkTypeConfig'
import { openLink } from '../../../../utils/openLink'
import SectionTitle from '../../../shared/SectionTitle'
import { cardSx } from '../../../../styles/cardSx'
import { SECTION_HEADER_COLORS } from '../../../../styles/sectionHeaderSx'
import type { Project } from '../../../../types/projects'

export function ContextLinks({ projects, incrementLinkVisits }: { projects: Project[]; incrementLinkVisits: (id: string) => void }) {
  const links = useMemo(() => {
    const all = projects.flatMap((p) =>
      (p.links ?? []).map((l) => ({ ...l, projectName: p.projectName, projectId: p.id })),
    )
    return all.slice(0, 10)
  }, [projects])

  if (links.length === 0) return null

  return (
    <>
    <SectionTitle color={SECTION_HEADER_COLORS.contextLinks}>Context Links</SectionTitle>
    <Box sx={cardSx}>
      {links.map((link) => {
        const { Icon, iconColor } = getLinkTypeConfig(link.type)
        return (
          <Box
            key={link.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.6,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={() => openLink(link.id, link.url, incrementLinkVisits)}
          >
            <Icon sx={{ fontSize: 18, color: iconColor }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#58a6ff', flex: 1 }}>
              {link.label}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#484f58' }}>
              {link.projectName}
            </Typography>
          </Box>
        )
      })}
    </Box>
    </>
  )
}

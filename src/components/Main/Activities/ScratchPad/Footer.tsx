import { Box, Typography } from '@mui/material'

export interface FooterProps {
  wordCount: number
  characterCount: number
}

export default function Footer({ wordCount, characterCount }: FooterProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'var(--scratchpad-footer-bg)',
        color: 'var(--scratchpad-text-muted)',
        px: 2,
        py: 0.75,
        flexShrink: 0,
      }}
    >
      <Typography variant="caption" sx={{ fontSize: 11, color: 'var(--scratchpad-text-muted)' }}>
        {wordCount} WORDS  {characterCount} CHARACTERS
      </Typography>
    </Box>
  )
}

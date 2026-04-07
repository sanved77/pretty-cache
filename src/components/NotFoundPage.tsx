import { Box, Button, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        bgcolor: 'var(--main-content-bg)',
        color: 'var(--scratchpad-text)',
        p: 3,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ maxWidth: 420, textAlign: 'center' }}>
        <Typography
          component="p"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--scratchpad-text-muted)',
            mb: 1,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
          Page not found
        </Typography>
        <Typography
          sx={{
            color: 'var(--scratchpad-text-muted)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            mb: 2,
            wordBreak: 'break-word',
          }}
        >
          There is no page at{' '}
          <Box component="span" sx={{ color: 'var(--scratchpad-text)', fontFamily: 'monospace' }}>
            {location.pathname}
          </Box>
          .
        </Typography>
        <Typography
          sx={{
            color: 'var(--scratchpad-text-muted)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          Check the URL or go back to the home screen.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/"
          sx={{
            bgcolor: 'var(--projects-metric-color)',
            '&:hover': { bgcolor: 'var(--projects-metric-color)', opacity: 0.92 },
          }}
        >
          Back to Today
        </Button>
      </Box>
    </Box>
  )
}

import { Box } from '@mui/material'
import SidebarItems from './SidebarItems'
import Favorites from './Favorites'
import CreateNew from './CreateNew'

function PrettyCacheLogo() {
  return (
    <svg width="160" height="32" viewBox="0 0 160 32" fill="none">
      <rect x="0" y="2" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="8" y="2" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="16" y="2" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="24" y="2" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="0" y="10" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="8" y="10" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="16" y="10" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="24" y="10" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="0" y="18" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="8" y="18" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="16" y="18" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="24" y="18" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="0" y="26" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="8" y="26" width="6" height="6" rx="1" fill="#1e2a3a" />
      <rect x="16" y="26" width="6" height="6" rx="1" fill="#58a6ff" />
      <rect x="24" y="26" width="6" height="6" rx="1" fill="#1e2a3a" />
      <text x="38" y="22" fontFamily="'Cascadia Code','SF Mono','Fira Code',monospace" fontSize="14" fontWeight="600">
        <tspan fill="#e6edf3">pretty</tspan>
        <tspan fill="#30363d">.</tspan>
        <tspan fill="#58a6ff">cache</tspan>
        <tspan fill="#3fb950">()</tspan>
      </text>
    </svg>
  )
}

export default function Sidebar() {
  return (
    <Box
      sx={{
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        px: 3,
        pt: 3,
        pb: 3,
      }}
    >
      <Box sx={{ mb: 0.5 }}>
        <PrettyCacheLogo />
      </Box>
      <SidebarItems />
      <Favorites />
      <CreateNew />
    </Box>
  )
}

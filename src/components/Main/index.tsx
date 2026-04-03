import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'
import ActivityBoard from './ActivityBoard'

export default function Main() {
  const isTodayPage = useLocation().pathname === '/'

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: isTodayPage ? '#0d1117' : 'var(--main-content-bg)',
      }}
    >
      <SearchBar />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ActivityBoard />
      </Box>
    </Box>
  )
}

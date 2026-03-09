import { Box } from '@mui/material'
import SearchBar from './SearchBar'
import ActivityBoard from './ActivityBoard'

export default function Main() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#1E2128',
      }}
    >
      <SearchBar />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ActivityBoard />
      </Box>
    </Box>
  )
}

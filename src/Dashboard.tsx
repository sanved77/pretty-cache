import { Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Main from './components/Main'
import LogBoard from './components/LogBoard'

export default function Dashboard() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
      <Box sx={{ flex: '0 0 15%' }}>
        <Sidebar />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Main />
      </Box>
      <Box sx={{ flex: '0 0 20%' }}>
        <LogBoard />
      </Box>
    </Box>
  )
}

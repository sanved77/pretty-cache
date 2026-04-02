import '@fontsource/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import 'react-resizable/css/styles.css'
import './styles/variables.css'
import './index.css'
import App from './App.tsx'
import {
  exportMissionControlStorage,
  importMissionControlStorage,
} from './dev/missionControlStorage'

if (import.meta.env.DEV) {
  window.missionControl = {
    export: exportMissionControlStorage,
    importData: importMissionControlStorage,
  }
}

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

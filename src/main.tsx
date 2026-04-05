import '@fontsource/cascadia-code'
import '@fontsource/cascadia-code/300.css'
import '@fontsource/cascadia-code/500.css'
import '@fontsource/cascadia-code/600.css'
import '@fontsource/cascadia-code/700.css'
import { APP_CONTENT_FONT_WEIGHT, APP_FONT_FAMILY } from './styles/appFont'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import 'react-resizable/css/styles.css'
import './styles/variables.css'
import './index.css'
import App from './App.tsx'
import {
  exportPrettyCacheStorage,
  importPrettyCacheStorage,
} from './dev/prettyCacheStorage'

if (import.meta.env.DEV) {
  window.prettyCache = {
    export: exportPrettyCacheStorage,
    importData: importPrettyCacheStorage,
  }
}

const theme = createTheme({
  typography: {
    fontFamily: APP_FONT_FAMILY,
    fontWeightLight: APP_CONTENT_FONT_WEIGHT,
    fontWeightRegular: APP_CONTENT_FONT_WEIGHT,
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

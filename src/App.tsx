import './App.css'
import { Routes, Route } from 'react-router-dom'
import { SnackbarProviderWrapper } from './contexts/SnackbarContext'
import Dashboard from './Dashboard'
import { ScratchPad } from './components/Main/Activities/ScratchPad'
import { Projects, ProjectHome } from './components/Main/Activities/Projects'

function App() {
  return (
    <SnackbarProviderWrapper>
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route path="scratchpad" element={<ScratchPad />} />
        <Route path="projects">
          <Route index element={<ProjectHome />} />
          <Route path=":projectId" element={<Projects />} />
        </Route>
      </Route>
    </Routes>
    </SnackbarProviderWrapper>
  )
}

export default App

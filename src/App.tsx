import './App.css'
import { useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { SnackbarProviderWrapper } from './contexts/SnackbarContext'
import Dashboard from './Dashboard'
import { ScratchPad } from './components/Main/Activities/ScratchPad'
import { Projects, ProjectHome } from './components/Main/Activities/Projects'
import Today from './components/Main/Activities/Today/Today'
import { Settings } from './components/Main/Activities/Settings'
import CommandPalette from './components/CommandPalette/CommandPalette'
import { seedSearchIndex } from './search/seedSearchIndex'

function ProjectsRoute() {
  const { projectId } = useParams<{ projectId: string }>()
  return <Projects key={projectId} />
}

function App() {
  useEffect(() => {
    const id =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(() => seedSearchIndex())
        : setTimeout(() => seedSearchIndex(), 0)
    return () => {
      if (typeof cancelIdleCallback === 'function' && typeof id === 'number') {
        cancelIdleCallback(id)
      }
    }
  }, [])

  return (
    <SnackbarProviderWrapper>
    <CommandPalette />
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route index element={<Today />} />
        <Route path="scratchpad" element={<ScratchPad />} />
        <Route path="settings" element={<Settings />} />
        <Route path="projects">
          <Route index element={<ProjectHome />} />
          <Route path=":projectId" element={<ProjectsRoute />} />
        </Route>
      </Route>
    </Routes>
    </SnackbarProviderWrapper>
  )
}

export default App

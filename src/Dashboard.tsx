import { useRef, useState, useEffect, type Ref } from 'react'
import throttle from 'lodash/throttle'
import { Box } from '@mui/material'
import { ResizableBox, type ResizeCallbackData } from 'react-resizable'
import Sidebar from './components/Sidebar'
import Main from './components/Main'
import LogBoard from './components/LogBoard'
import { useLogWriter } from './hooks/useLogWriter'

const MIN_SIDEBAR = 250
const MIN_MAIN = 700
const MIN_LOGBOARD = 450

function createResizeHandle() {
  return (handleAxis: string, ref: Ref<HTMLElement>) => (
    <span
      ref={ref as Ref<HTMLSpanElement>}
      className={`react-resizable-handle react-resizable-handle-${handleAxis} prettycache-resize-handle`}
      style={{
        display: 'block',
        width: '8px',
        height: '100%',
        cursor: 'col-resize',
        flexShrink: 0,
      }}
      aria-label="Resize"
    />
  )
}

const ResizeHandle = createResizeHandle()

export default function Dashboard() {
  useLogWriter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  const containerHeight = window.innerHeight
  const [sidebarWidth, setSidebarWidth] = useState(
    Math.floor(0.15 * (typeof window !== 'undefined' ? window.innerWidth : 1200))
  )
  const [logboardWidth, setLogboardWidth] = useState(
    Math.floor(0.2 * (typeof window !== 'undefined' ? window.innerWidth : 1200))
  )
  const [isSidebarResizing, setIsSidebarResizing] = useState(false)
  const [isLogboardResizing, setIsLogboardResizing] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const throttledUpdateWidth = throttle(
      () => setContainerWidth(el.offsetWidth),
      50
    )
    const ro = new ResizeObserver(() => throttledUpdateWidth())
    ro.observe(el)
    return () => {
      throttledUpdateWidth.cancel()
      ro.disconnect()
    }
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <ResizableBox
        width={sidebarWidth}
        height={containerHeight}
        axis="x"
        resizeHandles={['e']}
        handle={ResizeHandle}
        minConstraints={[MIN_SIDEBAR, containerHeight]}
        maxConstraints={[
          containerWidth - MIN_MAIN - MIN_LOGBOARD,
          containerHeight,
        ]}
        onResizeStart={() => setIsSidebarResizing(true)}
        onResizeStop={() => setIsSidebarResizing(false)}
        onResize={(_e, data: ResizeCallbackData) =>
          setSidebarWidth(data.size.width)}
        style={{ flexShrink: 0 }}
      >
        <Box
          sx={{
            height: '100%',
            boxSizing: 'border-box',
            borderRight: isSidebarResizing ? '2px solid white' : 'none',
          }}
        >
          <Sidebar />
        </Box>
      </ResizableBox>
      <Box sx={{ flex: 1, minWidth: MIN_MAIN, flexShrink: 0 }}>
        <Main />
      </Box>
      <ResizableBox
        width={logboardWidth}
        height={containerHeight}
        axis="x"
        resizeHandles={['w']}
        handle={ResizeHandle}
        minConstraints={[MIN_LOGBOARD, containerHeight]}
        maxConstraints={[
          containerWidth - sidebarWidth - MIN_MAIN,
          containerHeight,
        ]}
        onResizeStart={() => setIsLogboardResizing(true)}
        onResizeStop={() => setIsLogboardResizing(false)}
        onResize={(_e, data: ResizeCallbackData) =>
          setLogboardWidth(data.size.width)}
        style={{ flexShrink: 0 }}
      >
        <Box
          sx={{
            height: '100%',
            boxSizing: 'border-box',
            borderLeft: isLogboardResizing ? '2px solid white' : 'none',
          }}
        >
          <LogBoard />
        </Box>
      </ResizableBox>
    </Box>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import throttle from 'lodash/throttle'

const STORAGE_KEY = 'notes'
const THROTTLE_MS = 400

function getInitialContent(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return ''
    const parsed = JSON.parse(raw) as unknown
    if (parsed !== null && typeof parsed === 'object' && 'content' in parsed && typeof (parsed as { content: unknown }).content === 'string') {
      return (parsed as { content: string }).content
    }
    return ''
  } catch {
    return ''
  }
}

function saveNotes(content: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ content }))
}

export function useScratchpadNotes(): { content: string; setContent: (value: string) => void } {
  const [content, setContentState] = useState(getInitialContent)
  const contentRef = useRef(content)
  const saveToStorageRef = useRef<ReturnType<typeof throttle> | null>(null)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    saveToStorageRef.current = throttle(() => {
      saveNotes(contentRef.current)
    }, THROTTLE_MS)
    return () => {
      saveToStorageRef.current?.flush()
      saveToStorageRef.current?.cancel()
      saveToStorageRef.current = null
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        saveNotes('')
        return
      }
      const parsed = JSON.parse(raw) as unknown
      if (parsed === null || typeof parsed !== 'object' || !('content' in parsed) || typeof (parsed as { content: unknown }).content !== 'string') {
        saveNotes('')
      }
    } catch {
      saveNotes('')
    }
  }, [])

  const setContent = useCallback((value: string) => {
    setContentState(value)
    contentRef.current = value
    saveToStorageRef.current?.()
  }, [])

  return { content, setContent }
}

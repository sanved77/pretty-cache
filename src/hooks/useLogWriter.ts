import { useEffect } from 'react'
import { storageEvents, type StorageNotification } from '../utils/storageEvents'
import { NOTIFICATION_TO_ACTION, type LogEntry } from '../types/logs'
import type { Task } from '../types/projects'

const LOGS_KEY = 'logs'

function readLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLogs(logs: LogEntry[]) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
  window.dispatchEvent(new CustomEvent('prettycache-logs-updated'))
}

function lookupContent(id: string, contentType: string): string {
  try {
    if (contentType === 'task') {
      const tasks: Task[] = JSON.parse(localStorage.getItem('tasks') ?? '[]')
      return tasks.find((t) => t.id === id)?.content ?? id
    }
    if (contentType === 'blocker') {
      const blockers = JSON.parse(localStorage.getItem('blockers') ?? '[]')
      return blockers.find((b: { id: string; text: string }) => b.id === id)?.text ?? id
    }
    if (contentType === 'question') {
      const questions = JSON.parse(localStorage.getItem('questions') ?? '[]')
      return questions.find((q: { id: string; text: string }) => q.id === id)?.text ?? id
    }
    if (contentType === 'project') {
      const projects = JSON.parse(localStorage.getItem('projects') ?? '[]')
      return projects.find((p: { id: string; projectName: string }) => p.id === id)?.projectName ?? id
    }
    if (contentType === 'parkingLot') {
      const items = JSON.parse(localStorage.getItem('parkingLot') ?? '[]')
      return items.find((i: { id: string; content: string }) => i.id === id)?.content ?? id
    }
  } catch {
    return id
  }
  return id
}

function handleNotification(n: StorageNotification) {
  const action = NOTIFICATION_TO_ACTION[n.type]
  if (!action) return

  const content = n.contentText ?? lookupContent(n.content.id, n.content.contentType)
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: n.timestamp,
    action,
    content,
  }

  const logs = readLogs()
  logs.unshift(entry)
  writeLogs(logs)
}

export function useLogWriter() {
  useEffect(() => {
    const unsubscribe = storageEvents.subscribe(handleNotification)
    return unsubscribe
  }, [])
}

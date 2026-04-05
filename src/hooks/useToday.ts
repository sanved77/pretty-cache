import { useState, useEffect, useCallback } from 'react'
import type { TodayItem } from '../types/today'

const STORAGE_KEY = 'today'
const RESET_HOUR = 6

function getTodayResetTimestamp(): number {
  const now = new Date()
  const reset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), RESET_HOUR, 0, 0, 0)
  return reset.getTime()
}

function readItems(): TodayItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is TodayItem =>
        i != null &&
        typeof i === 'object' &&
        typeof (i as Record<string, unknown>).id === 'string' &&
        typeof (i as Record<string, unknown>).content === 'string' &&
        typeof (i as Record<string, unknown>).createdAt === 'string' &&
        ((i as Record<string, unknown>).status === 'open' ||
          (i as Record<string, unknown>).status === 'done'),
    )
  } catch {
    return []
  }
}

function shouldAutoReset(items: TodayItem[]): boolean {
  if (items.length === 0) return false
  const now = Date.now()
  const resetTs = getTodayResetTimestamp()
  if (now < resetTs) return false
  return items.every((item) => new Date(item.createdAt).getTime() < resetTs)
}

export function useToday() {
  const [items, setItems] = useState<TodayItem[]>(() => {
    const stored = readItems()
    if (shouldAutoReset(stored)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
      return []
    }
    return stored
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const item: TodayItem = {
      id: crypto.randomUUID(),
      content: trimmed,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => [...prev, item])
  }, [])

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'open' ? 'done' : 'open' }
          : item,
      ),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { items, addItem, toggleItem, removeItem }
}

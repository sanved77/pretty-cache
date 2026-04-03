import { useState, useEffect, useCallback } from 'react'
import type { ParkingItem } from '../types/today'
import { getProjectColor } from '../utils/projectColor'

const STORAGE_KEY = 'parkingLot'

function readItems(): ParkingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is ParkingItem =>
        i != null &&
        typeof i === 'object' &&
        typeof (i as Record<string, unknown>).id === 'string' &&
        typeof (i as Record<string, unknown>).content === 'string' &&
        typeof (i as Record<string, unknown>).createdAt === 'string' &&
        typeof (i as Record<string, unknown>).color === 'string',
    )
  } catch {
    return []
  }
}

export function useParkingLot() {
  const [items, setItems] = useState<ParkingItem[]>(readItems)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const id = crypto.randomUUID()
    const item: ParkingItem = {
      id,
      content: trimmed,
      createdAt: new Date().toISOString(),
      color: getProjectColor(id),
    }
    setItems((prev) => [...prev, item])
  }, [])

  return { items, addItem }
}

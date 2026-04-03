export interface TodayItem {
  id: string
  content: string
  status: 'open' | 'done'
  createdAt: string
}

export interface ParkingItem {
  id: string
  content: string
  createdAt: string
  color: string
}

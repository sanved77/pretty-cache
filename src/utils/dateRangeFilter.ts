/** Start of local calendar day (00:00:00.000). */
export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** End of local calendar day (23:59:59.999). */
export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** Returns true if `createdOnMs` falls within [start, end] inclusive, using start-of-day / end-of-day bounds. */
export function isCreatedOnInDateRange(
  createdOnMs: number,
  range: { start: Date; end: Date } | null,
): boolean {
  if (range == null) return true
  const startMs = startOfDay(range.start).getTime()
  const endMs = endOfDay(range.end).getTime()
  return createdOnMs >= startMs && createdOnMs <= endMs
}

/**
 * Deterministic color for a project id (e.g. UUID). Same id always maps to the same color;
 * no storage required.
 */
const PROJECT_COLORS = [
  '#00a3ff',
  '#7c4dff',
  '#00bfa5',
  '#ff6b6b',
  '#ffc107',
  '#e91e63',
  '#4caf50',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
] as const

export function getProjectColor(projectId: string): string {
  const hash = projectId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PROJECT_COLORS[hash % PROJECT_COLORS.length]
}

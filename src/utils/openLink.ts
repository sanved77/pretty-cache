import { pushRecentLink } from './trackedStorage'

/**
 * Opens a link in a new tab, increments visit count in project state, and records recents.
 * Use with incrementLinkVisits from useProjects.
 */
export function openLink(
  linkId: string,
  url: string,
  incrementVisits: (linkId: string) => void,
): void {
  window.open(url, '_blank', 'noopener,noreferrer')
  incrementVisits(linkId)
  pushRecentLink(linkId)
}

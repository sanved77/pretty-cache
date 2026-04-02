/// <reference types="vite/client" />

import type { MissionControlStorageExport } from './dev/missionControlStorage'

declare global {
  interface Window {
    missionControl?: {
      export: () => MissionControlStorageExport
      importData: (data: unknown) => void
    }
  }
}

export {}

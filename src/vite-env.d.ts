/// <reference types="vite/client" />

import type { PrettyCacheStorageExport } from './dev/prettyCacheStorage'

declare global {
  interface Window {
    prettyCache?: {
      export: () => PrettyCacheStorageExport
      importData: (data: unknown) => void
    }
  }
}

export {}

import type { StorageProvider } from "../store/providers"

export {}

declare global {
  interface Window {
    /**
     * Provided and controlled by browser tests.
     */
    _testStorage?: StorageProvider
  }
}

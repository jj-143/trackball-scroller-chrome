import type { Cleanup, OnChange, StorageProvider } from "./providers"

export const DEFAULT_USER_SETTINGS: UserSettings = {
  enabled: true,
  userOption: {
    scroller: {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: {
          ctrl: false,
          alt: false,
          shift: false,
          meta: false,
        },
        nonActivation: {
          ctrl: true,
          alt: false,
          shift: false,
          meta: false,
        },
      },
      sensitivity: 10,
      naturalScrolling: true,
    },
  },
}

/**
 * Store class handles the loading and saving of the user settings.
 *
 * Actual data persists are handled by a `StorageProvider` implementation.
 */
export class Store {
  #store?: UserSettings
  #provider: StorageProvider

  constructor({ provider }: { provider: StorageProvider }) {
    this.#provider = provider
    this.#listenUpdatesFromProvider()
  }

  #listenUpdatesFromProvider() {
    this.#provider.onChange((store, old) => {
      this.#store = store
    })
  }

  async #loadStore() {
    this.#store = await this.#provider.load()
  }

  async getStore(): Promise<UserSettings> {
    if (!this.#store) await this.#loadStore()
    return this.#store!
  }

  async updateStore(store: UserSettings): Promise<void> {
    return this.#provider.save(store).then(() => {
      this.#store = store
    })
  }

  onUpdate(callback: OnChange): Cleanup {
    return this.#provider.onChange(callback)
  }
}

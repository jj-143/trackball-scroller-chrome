import { StorageProvider } from "./providers"

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

type OnUpdateListener = (store: UserSettings, old?: UserSettings) => void

/**
 * Store class handles the loading and saving of the user settings.
 *
 * Actual data persists are handled by a `StorageProvider` implementation.
 */
export class Store {
  #store?: UserSettings
  #provider: StorageProvider
  #onUpdateListeners: Set<OnUpdateListener> = new Set()

  constructor({ provider }: { provider: StorageProvider }) {
    this.#provider = provider
    this.#listenUpdatesFromProvider()
  }

  static #deepClone(store: UserSettings): UserSettings {
    // we can do this since the store is JSON-ifiable.
    return JSON.parse(JSON.stringify(store))
  }

  #listenUpdatesFromProvider() {
    this.#provider.onChange((store, old) => {
      this.#onUpdateListeners.forEach((listener) => {
        listener(store, old)
      })
      this.#store = store
    })
  }

  async #loadStore() {
    const storage = await this.#provider.load()
    if (storage) {
      this.#store = storage as UserSettings
    } else {
      this.#store = DEFAULT_USER_SETTINGS
      this.#provider.save(DEFAULT_USER_SETTINGS)
    }
  }

  async getStore(): Promise<UserSettings> {
    if (!this.#store) await this.#loadStore()
    // returning a clone to prevent direct manipulation.
    return Store.#deepClone(this.#store as UserSettings)
  }

  async updateStore(store: UserSettings): Promise<void> {
    return this.#provider.save(store).then(() => {
      this.#store = store
    })
  }

  onUpdate(fn: (store: UserSettings, old?: UserSettings) => void): () => void {
    this.#onUpdateListeners.add(fn)
    // cleanup function
    return () => this.#onUpdateListeners.delete(fn)
  }
}

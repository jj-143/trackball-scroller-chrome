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
  private settings?: UserSettings
  private provider: StorageProvider

  constructor({ provider }: { provider: StorageProvider }) {
    this.provider = provider
    this.listenUpdatesFromProvider()
  }

  async get(): Promise<UserSettings> {
    if (!this.settings) await this.loadFromProvider()
    return this.settings!
  }

  async update(settings: UserSettings) {
    await this.provider.save(settings)
    this.settings = settings
  }

  onUpdate(callback: OnChange): Cleanup {
    return this.provider.onChange(callback)
  }

  private listenUpdatesFromProvider() {
    this.provider.onChange((settings) => {
      this.settings = settings
    })
  }

  private async loadFromProvider() {
    this.settings = await this.provider.load()
  }
}

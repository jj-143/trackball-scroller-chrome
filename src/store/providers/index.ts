export interface StorageProvider {
  load: () => Promise<UserSettings | undefined>
  save: (store: UserSettings) => Promise<void>
  onChange: (
    callback: (store: UserSettings, old?: UserSettings) => void
  ) => void
}

type OnChangeCallback = Parameters<StorageProvider["onChange"]>[0]

export class InMemoryStorage implements StorageProvider {
  store?: UserSettings
  callbacks = new Set<OnChangeCallback>()

  async load() {
    return this.store
  }

  async save(store: UserSettings) {
    this.store = store
    this.callbacks.forEach((callback) => {
      callback(store)
    })
  }

  onChange(callback: OnChangeCallback) {
    this.callbacks.add(callback)
  }
}

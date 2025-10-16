import { DEFAULT_USER_SETTINGS } from ".."

export type OnChange = (settings: UserSettings, old?: UserSettings) => void
export type Cleanup = () => void

export abstract class StorageProvider {
  private onChangeCallbacks = new Set<OnChange>()

  abstract load(): Promise<UserSettings>

  abstract save(settings: UserSettings): Promise<void>

  onChange(listener: OnChange): Cleanup {
    this.onChangeCallbacks.add(listener)
    return () => this.onChangeCallbacks.delete(listener)
  }

  protected notifyChange(settings: UserSettings) {
    this.onChangeCallbacks.forEach((callback) => callback(settings))
  }
}

export class InMemoryStorage extends StorageProvider {
  private settings?: UserSettings

  override async load() {
    if (!this.settings) {
      await this.save(DEFAULT_USER_SETTINGS)
    }

    return this.settings!
  }

  override async save(settings: UserSettings) {
    this.settings = settings
    this.notifyChange(settings)
  }
}

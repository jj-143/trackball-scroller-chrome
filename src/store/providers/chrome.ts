import { StorageProvider } from "."
import { DEFAULT_USER_SETTINGS } from ".."

export default class ChromeStorage extends StorageProvider {
  static readonly key = "USER_SETTINGS"

  constructor() {
    super()
    this.listenStorageUpdate()
  }

  override async load(): Promise<UserSettings> {
    const item = await chrome.storage.sync.get(ChromeStorage.key)
    const settings: UserSettings | undefined = item[ChromeStorage.key]

    if (!settings) {
      await this.save(DEFAULT_USER_SETTINGS)
      return DEFAULT_USER_SETTINGS
    }

    return settings
  }

  override async save(settings: UserSettings) {
    return chrome.storage.sync.set({ [ChromeStorage.key]: settings })
  }

  private listenStorageUpdate() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync") {
        const storage = changes[ChromeStorage.key]
        this.notifyChange(storage.newValue)
      }
    })
  }
}

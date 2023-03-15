import type { StorageProvider } from "."

export default class ChromeStorage implements StorageProvider {
  static readonly key = "USER_SETTINGS"

  load() {
    return new Promise<UserSettings>((resolve, reject) => {
      try {
        chrome.storage.sync.get(ChromeStorage.key, (items) => {
          items[ChromeStorage.key]
          resolve(items[ChromeStorage.key])
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  save(store: UserSettings) {
    return new Promise<void>((resolve, reject) => {
      try {
        chrome.storage.sync.set({ [ChromeStorage.key]: store }, () => {
          resolve()
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  onChange(callback: (store: UserSettings, old?: UserSettings) => void) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync") {
        const storage = changes[ChromeStorage.key]
        if (storage?.oldValue) {
          callback(storage.newValue, storage.oldValue)
        }
      }
    })
  }
}

const DEFAULT_USER_SETTINGS: UserSettings = {
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
          ctrl: false,
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

async function _setDefault(store) {
  return store ? store : DEFAULT_USER_SETTINGS
}

function _loadSettings() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("USER_SETTINGS", ({ USER_SETTINGS: setting }) => {
        resolve(setting)
      })
    } catch (e) {
      reject(e)
    }
  })
}

function _saveSettings(store) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set({ USER_SETTINGS: store }, () => {
        resolve(store)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export class Store {
  _store: UserSettings

  constructor() {
    this._keepStore = this._keepStore.bind(this)
  }

  async _keepStore(store) {
    this._store = store
    return store
  }

  async get(): Promise<UserSettings> {
    return this._store
      ? this._store
      : _loadSettings()
          .then(_setDefault)
          .then(this._keepStore)
          .catch((e) => {
            console.log(e)
          })
  }

  async save(store) {
    return _saveSettings(store)
      .then(this._keepStore)
      .catch((e) => {})
  }

  getScrollerSetting(): Promise<StoreResponse> {
    return this.get().then((store) => ({
      enabled: store.enabled,
      scrollerConfig: store.userOption.scroller,
    }))
  }
}

function migrateSettingsFrom_0_0_3(): Promise<UserSettings> {
  // migrate from 0.0.3 to 1.0.0
  return loadSettings_0_0_3().then((setting) => {
    // FIXME
    const newSetting: UserSettings = DEFAULT_USER_SETTINGS
    return newSetting
  })
}

function loadSettings_0_0_3() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("setting", (setting) => {
        resolve(setting)
      })
    } catch (e) {
      reject(e)
    }
  })
}

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
  console.log("_setDefault:", store)
  return Object.keys(store).length ? store : DEFAULT_USER_SETTINGS
}

function loadSettings() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get("USER_SETTINGS", (setting) => {
        resolve(setting)
      })
    } catch (e) {
      reject(e)
    }
  })
}

function saveSettings(store) {
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
    console.log("_store:", store)
    console.log("this", this)
    this._store = store
    return store
  }

  async get(): Promise<UserSettings> {
    if (this._store) {
      return this._store
    }

    // DEV
    // return loadSettings()
    return new Promise((resolve) => resolve({}))
      .then(_setDefault)
      .then(this._keepStore)
      .catch((e) => {
        console.log(e)
      })
  }

  async save(store) {
    return saveSettings(store)
      .then(this._keepStore)
      .catch((e) => {})
  }

  getScrollerOption() {
    return this.get().then((store) => {
      console.log(store)
      return {
        scrollerOption: store.userOption.scroller,
        enabled: store.enabled,
      }
    })
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

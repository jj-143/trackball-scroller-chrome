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

async function _setDefault(store: UserSettings): Promise<UserSettings> {
  return store ? store : saveSettings(DEFAULT_USER_SETTINGS)
}

function loadSettings(): Promise<UserSettings> {
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

function saveSettings(store: UserSettings): Promise<UserSettings> {
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
      : loadSettings()
          .then(_setDefault)
          .then(this._keepStore)
          .catch((e) => {
            console.log(e)
          })
  }

  async save(store: UserSettings): Promise<UserSettings> {
    return saveSettings(store).then(this._keepStore)
  }

  getScrollerSetting(): Promise<StoreResponse> {
    return this.get().then((store) => ({
      enabled: store.enabled,
      scrollerConfig: store.userOption.scroller,
    }))
  }
}

import { updateSettingsReducer } from "./utils/utils"
import * as UI from "./utils/page"
import { Store } from "../../store"
import ChromeStorage from "../../store/providers/chrome"
import { InMemoryStorage } from "../../store/providers"

// initialize DOM related features

UI.setContext({
  updateOption: async (type, payload) => {
    const oldSettings = await store.getStore()
    const newSettings = updateSettingsReducer(oldSettings, type, payload)
    store.updateStore(newSettings)
  },
})

// For dev & test enviroment where it can't access the extension storage
const isDEV = import.meta.env.DEV
const isExtensionPage = location.href.startsWith("chrome-extension://")
const useTestStorage = isDEV && !isExtensionPage

export const store = new Store({
  provider: useTestStorage
    ? window._testStorage ?? new InMemoryStorage()
    : new ChromeStorage(),
})

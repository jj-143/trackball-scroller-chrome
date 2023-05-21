import { formatActivation, updateSettingsReducer } from "./utils/utils"
import * as UI from "./utils/page"
import Scroller from "../scroller"
import { Store } from "../store"
import ChromeStorage from "../store/providers/chrome"
import { InMemoryStorage } from "../store/providers"

const scroller = new Scroller()

// Bypass trigger on the "customize activation" button
scroller.checkTrigger = function (e: MouseEvent) {
  const elm = e.target as Element
  const originalFn = Scroller.prototype.checkTrigger.bind(scroller)
  if (elm.classList.contains("activation")) {
    return
  }
  return originalFn(e)
}

// initialize DOM related features

UI.setContext({
  updateOption: async (type, payload) => {
    const oldSettings = await store.getStore()
    const newSettings = updateSettingsReducer(oldSettings, type, payload)

    if (
      type === "ACTIVATION" &&
      formatActivation(oldSettings.userOption.scroller.activation) ===
        formatActivation(newSettings.userOption.scroller.activation)
    ) {
      UI.updateDOM(oldSettings)
      return
    }
    store.updateStore(newSettings)
  },
  cancelCustomizeActivation: async () => {
    UI.updateDOM(await store.getStore())
  },
})

UI.makeTestArticles()
UI.attachEvents()

// For dev & test enviroment where it can't access the extension storage
const notInProduction = process.env.NODE_ENV !== "production"
const isExtensionPage = location.href.startsWith("chrome-extension://")
const useTestStorage = notInProduction && !isExtensionPage

// Stores

const store = new Store({
  provider: useTestStorage
    ? window._testStorage ?? new InMemoryStorage()
    : new ChromeStorage(),
})

store
  .getStore()
  .then((store) => {
    scroller.init(store.userOption.scroller)
    // always enable in Options page
    scroller.enable()
    UI.updateDOM(store)
  })
  // provide onUpdate callback after initialized
  // to prevent updating before initalized
  .then(() => {
    store.onUpdate((store) => {
      scroller.updateConfig(store.userOption.scroller)
      UI.updateDOM(store)
    })
  })

import { Payload, formatActivation, updateSettingsReducer } from "./utils/utils"
import { updateDOM, makeTestArticles, attachEvents } from "./utils/page"
import Scroller from "../scroller"
import { Store } from "../store"
import ChromeStorage from "../store/providers/chrome"
import { InMemoryStorage } from "../store/providers"

let settings: UserSettings
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

export async function handleOptionUpdate<T extends keyof Payload>(
  type: T,
  payload: Payload[T]
) {
  const oldSettings = await store.getStore()
  const newSettings = updateSettingsReducer(oldSettings, type, payload)

  if (
    type === "ACTIVATION" &&
    formatActivation(oldSettings.userOption.scroller.activation) ===
      formatActivation(newSettings.userOption.scroller.activation)
  ) {
    updateDOM(oldSettings)
    return
  }
  store.updateStore(newSettings)
}

// NOTE: Will be replaced with direct function call rather than Custom Events

export async function handleCancelCustomizeActivation() {
  updateDOM(await store.getStore())
}

// initialize DOM related features

makeTestArticles()
attachEvents()

// For dev & test enviroment where it can't access the extension storage
const isDev = process.env.NODE_ENV === "development"
const isExtensionPage = location.href.startsWith("chrome-extension://")
const useTestStorage = isDev && !isExtensionPage

// Stores

const store = new Store({
  provider: useTestStorage
    ? window._testStorage ?? new InMemoryStorage()
    : new ChromeStorage(),
})

store.onUpdate((store) => {
  update(store)
})

store.getStore().then((store) => {
  update(store)
})

/**
 * Updates DOM and Scroller settings
 */
function update(store: UserSettings) {
  settings = store
  updateDOM(store)
  updateScroller(store)
}

// will be removed once this gets incorporated into Scroller's mehtod; probably into `Scroller.updateConfig()`.
function updateScroller(store: UserSettings) {
  scroller.updateConfig(store.userOption.scroller)
  if (store.enabled !== scroller.isEnabled) {
    store.enabled ? scroller.enable() : scroller.disable()
  }
}

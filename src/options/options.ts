import { formatActivation } from "./utils/utils"
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

function handleOptionUpdate({ detail: { type, payload } }: CustomEvent) {
  const newSettings: UserSettings = JSON.parse(JSON.stringify(settings))

  switch (type) {
    case "ACTIVATION":
      // note: activation = combo + nonActivation (v1.0.0)
      newSettings.userOption.scroller.activation = {
        ...newSettings.userOption.scroller.activation,
        ...payload,
      }

      // same activation: revert to original
      if (
        formatActivation(newSettings.userOption.scroller.activation) ===
        formatActivation(settings.userOption.scroller.activation)
      ) {
        return updateDOM(settings)
      }
      break
    case "NON_ACTIVATION":
      newSettings.userOption.scroller.activation.nonActivation = {
        ...newSettings.userOption.scroller.activation.nonActivation,
        ...payload,
      }
      break
    case "SCROLLER_OPTION":
      newSettings.userOption.scroller = {
        ...newSettings.userOption.scroller,
        ...payload,
      }
      break
    case "SENSITIVITY":
      const newSensitivity =
        newSettings.userOption.scroller.sensitivity + payload
      if (newSensitivity < 1 || newSensitivity > 20) return
      newSettings.userOption.scroller.sensitivity = newSensitivity
      break
  }
  store.updateStore(newSettings)
}

// NOTE: Will be replaced with direct function call rather than Custom Events

document.addEventListener("UPDATE_OPTION", handleOptionUpdate)

document.addEventListener("CANCEL_CUSTOMIZE_ACTIVATION", () => {
  updateDOM(settings)
})

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

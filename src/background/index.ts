import "regenerator-runtime/runtime"
import Extension from "./extension"
import { connectReloader } from "../utils/reload"
import { migrateStoreFrom_0_0_3 } from "../store/migration"

const BROWSER_ACTION_ICON_PATH_ENABLED = "./images/icon.png"
const BROWSER_ACTION_TITLE_ENABLED = ""
const BROWSER_ACTION_ICON_PATH_DISABLED = "./images/icon-outline.png"
const BROWSER_ACTION_TITLE_DISABLED = "Trackball Scroller (disabled)"

const IS_DEV_BUILD = process.env.NODE_ENV == "development"

function updateBrowserActionIcon(enabled: boolean) {
  if (enabled) {
    chrome.browserAction.setIcon({
      path: BROWSER_ACTION_ICON_PATH_ENABLED,
    })
    chrome.browserAction.setTitle({
      title: BROWSER_ACTION_TITLE_ENABLED,
    })
  } else {
    chrome.browserAction.setIcon({
      path: BROWSER_ACTION_ICON_PATH_DISABLED,
    })
    chrome.browserAction.setTitle({
      title: BROWSER_ACTION_TITLE_DISABLED,
    })
  }
}

const extension = new Extension()

if (IS_DEV_BUILD) {
  connectReloader()
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage()
  }
  if (details.reason === "update") {
    if (IS_DEV_BUILD) {
      chrome.runtime.openOptionsPage()
    }
    if (details.previousVersion === "0.0.3") {
      migrateStoreFrom_0_0_3(extension.store)
    }
  }
})

// Enabled changed (via Browser Action)
chrome.browserAction.onClicked.addListener(async () => {
  const store = await extension.store.getStore()
  extension.store.updateStore({
    ...store,
    enabled: !store.enabled,
  })
})

// Initialize Browser Action Status
extension.store.getStore().then((store) => {
  updateBrowserActionIcon(store.enabled)
})

extension.store.onUpdate((store, old) => {
  if (store.enabled !== old?.enabled) {
    updateBrowserActionIcon(store.enabled)
  }
})

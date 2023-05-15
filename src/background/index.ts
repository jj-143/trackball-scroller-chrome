import Extension from "./extension"
import { migrateStoreFrom_0_0_3 } from "../store/migration"

import ACTION_ICON_PATH_ENABLED from "../images/icon.png"
import ACTION_ICON_PATH_DISABLED from "../images/icon-outline.png"

const ACTION_TITLE_ENABLED = ""
const ACTION_TITLE_DISABLED = "Trackball Scroller (disabled)"

const IS_DEV_BUILD = process.env.NODE_ENV !== "production"

/**
 * update icon and title based on "enabled" (from [Scroller.enabled])
 */
function updateActionUI(enabled: boolean) {
  if (enabled) {
    chrome.action.setIcon({
      path: ACTION_ICON_PATH_ENABLED,
    })
    chrome.action.setTitle({
      title: ACTION_TITLE_ENABLED,
    })
  } else {
    chrome.action.setIcon({
      path: ACTION_ICON_PATH_DISABLED,
    })
    chrome.action.setTitle({
      title: ACTION_TITLE_DISABLED,
    })
  }
}

const extension = new Extension()

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage()
  }
  if (details.reason === "update") {
    if (IS_DEV_BUILD) {
      // chrome.runtime.openOptionsPage()
    }
    if (details.previousVersion === "0.0.3") {
      migrateStoreFrom_0_0_3(extension.store)
    }
  }
})

// Enabled changed (via Action)
chrome.action.onClicked.addListener(async () => {
  const store = await extension.store.getStore()
  extension.store.updateStore({
    ...store,
    enabled: !store.enabled,
  })
})

// Initialize Action's UI
extension.store.getStore().then((store) => {
  updateActionUI(store.enabled)
})

extension.store.onUpdate((store, old) => {
  if (store.enabled !== old?.enabled) {
    updateActionUI(store.enabled)
  }
})

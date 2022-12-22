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

// Message from content script or options page
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case "GET_SCROLLER_SETTING":
      extension.store.getScrollerSetting().then(sendResponse)
      break
    case "GET_USER_SETTINGS": // Options page
      extension.store.get().then(sendResponse)
      break
    case "SAVE_USER_SETTINGS":
      extension.store
        .save(msg.settings)
        .then(() => {
          sendResponse()
        })
        .catch(() => {
          sendResponse("cannot be stored.")
        })
      break
  }
  return true
})

// Broadcast setting change
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync") {
    if (changes.USER_SETTINGS && changes.USER_SETTINGS.oldValue) {
      const userSetting = changes.USER_SETTINGS.newValue as UserSettings
      const storeResponse = {
        scrollerConfig: userSetting.userOption.scroller,
        enabled: userSetting.enabled,
      }
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            type: "UPDATE_SETTING",
            storeResponse,
          })
        })
      })

      if (userSetting.enabled !== changes.USER_SETTINGS.oldValue.enabled) {
        updateBrowserActionIcon(userSetting.enabled)
      }
    }
  }
})

// Enabled changed (via Browser Action)
chrome.browserAction.onClicked.addListener((tab) => {
  extension.store.get().then((store) => {
    store.enabled = !store.enabled
    extension.store.save(store)
  })
})

// Initialize Browser Action Status
extension.store.get().then((store) => {
  updateBrowserActionIcon(store.enabled)
})

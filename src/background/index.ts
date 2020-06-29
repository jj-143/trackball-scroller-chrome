import "regenerator-runtime/runtime"
import Extension from "./extension"
import { connect } from "../utils/reload"

const extension = new Extension()

// dev
connect()

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
  }
  if (details.reason === "update") {
    if (chrome.runtime.getManifest().version.split(".").length === 4) {
      // dev build
      chrome.runtime.openOptionsPage()
    }
  }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case "GET_SCROLLER_SETTING":
      extension.store.getScrollerSetting().then(sendResponse)
      break
    case "CONNECT":
      extension.addTab(sender.tab.id)
      break
    case "GET_USER_SETTINGS": // from Option
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

// User Setting changed
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync") {
    if (changes.USER_SETTINGS) {
      const userSetting = changes.USER_SETTINGS.newValue as UserSettings
      const storeResponse = {
        scrollerConfig: userSetting.userOption.scroller,
        enabled: userSetting.enabled,
      }
      extension.tabs.forEach((tabId) => {
        chrome.tabs.sendMessage(tabId, {
          type: "UPDATE_SETTING",
          storeResponse,
        })
      })

      if (userSetting.enabled !== changes.USER_SETTINGS.oldValue.enabled) {
        console.log(userSetting.enabled)
        updateBrowserActionIcon(userSetting.enabled)
      }
    }
  }
})

const { connect } = require("./utils/reload")

connect()
// default Setting.
const initSetting = {
  // options: checkboxes.
  naturalScrolling: {
    type: "options",
    value: true,
  },

  sensitivityStep: 10,
  sensitivityValue: 1,

  // startInScroll: {
  //   type: "options",
  //   value: false
  // },

  activation: {
    modifiers: [],
    input: {
      key: 1,
      text: "Mouse 2",
      type: "mouse",
    },
  },
  nonActivation: [],
}

// initial enabled setting
var enabled = true

console.log("background")
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log("onupdatea", detail)
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.sync.set({ setting: initSetting, enabled }, () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage()
      } else {
        window.open(chrome.runtime.getURL("options.html"))
      }
    })
  } else if (details.reason === "update") {
    // dev : open options page
    if (chrome.runtime.getManifest().version.split(".").length === 4) {
      chrome.runtime.openOptionsPage()
    }
    chrome.storage.sync.get("setting", ({ setting }) => {
      const migrated = {
        ...JSON.parse(JSON.stringify(initSetting)),
        ...setting,
      }

      chrome.storage.sync.set({ setting: migrated }, (newS) => {})
    })
  }
})

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.storage.sync.get("enabled", ({ enabled }) => {
    const newEnabled = !enabled

    if (newEnabled) {
      chrome.browserAction.setIcon({
        path: "./static/icon-c1-128.png",
      })
      chrome.browserAction.setTitle({
        title: "",
      })
    } else {
      chrome.browserAction.setIcon({
        path: "./static/icon-c1-128-outline.png",
      })
      chrome.browserAction.setTitle({
        title: "Trackball Scroller (disabled)",
      })
    }

    chrome.storage.sync.set({ enabled: newEnabled }, () => {})
  })
})
// default Setting.
const initSetting = {
  naturalScrolling: {
    type: "options",
    value: true,
  },

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
    // TODO: handle new settings variable
    // if there's new version includes new setting variables, include it.
    // var migration = false
    // for (var key in setting) {
    //   if (!setting[key]) {
    //     setting[key] = setting[key]
    //     migration = true
    //   }
    // }
    // if (migration) {
    //   chrome.storage.sync.set({ setting })
    // }
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

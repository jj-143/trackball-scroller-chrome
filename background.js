// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   if (changeInfo.status === "complete") {
//     console.log("tabs-onupdated, ", tabId, changeInfo, tab)
//     chrome.tabs.executeScript(tabId, {
//       file: "main.js"
//     })
//   }
// })

var enabled = true

chrome.browserAction.onClicked.addListener(tab => {
  console.log("ba: enabled:", enabled)
  enabled = !enabled

  if (enabled) {
    chrome.browserAction.setIcon({
      path: "/images/icon-c1-128.png"
    })
    chrome.browserAction.setTitle({
      title: ""
    })
  } else {
    chrome.browserAction.setIcon({
      path: "/images/icon-c1-128-outline.png"
    })
    chrome.browserAction.setTitle({
      title: "Trackball Scroller (disabled)"
    })
  }

  chrome.storage.sync.set({ enabled }, () => {
    // setting = initSetting
  })
})

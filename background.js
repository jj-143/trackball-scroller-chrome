var enabled = true

chrome.browserAction.onClicked.addListener(tab => {
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
  })
})

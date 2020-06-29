import Scroller from "./scroller"

export const scroller = new Scroller()

function getStore(): Promise<StoreResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SCROLLER_SETTING" }, resolve)
  })
}

function updateScroller({ enabled, scrollerConfig }: StoreResponse) {
  scroller.setConfig(scrollerConfig)
  if (enabled) {
    scroller.enable()
  } else {
    scroller.disable()
  }
}

// notify this tab
chrome.runtime.sendMessage({ type: "CONNECT" })

chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case "UPDATE_SETTING":
      const { scrollerConfig, enabled } = msg.storeResponse
      updateScroller({ scrollerConfig, enabled })
      break
  }
})

getStore().then(updateScroller)

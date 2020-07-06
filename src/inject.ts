import Scroller from "./scroller"

export const scroller = new Scroller()

function getStore(): Promise<StoreResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SCROLLER_SETTING" }, resolve)
  })
}

function updateScroller({ enabled, scrollerConfig }: StoreResponse) {
  scroller.updateConfig(scrollerConfig)
  if (enabled !== scroller.isEnabled) {
    enabled ? scroller.enable() : scroller.disable()
  }
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  switch (msg.type) {
    case "UPDATE_SETTING":
      updateScroller(msg.storeResponse)
      break
  }
})

getStore().then(updateScroller)

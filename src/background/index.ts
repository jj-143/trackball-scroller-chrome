const { connect } = require("./utils/reload")

connect()

import Extension from "./extension"

const extension = new Extension()

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg) {
    case "GET_SCROLLER_OPTION":
      extension.store
        .getScrollerOption()
        .then((r) => {
          console.log("sOption: ", r)
          return r
        })
        .then(({ scrollerOption, enabled }) => {
          console.log("bg: ", scrollerOption)
          sendResponse({ option: scrollerOption, enabled })
        })
      break
    case "CONNECT":
      //TODO
      extension.addTab(msg.tabID)
      break
  }
})

//TODO: later
// chrome.storage.onChanage

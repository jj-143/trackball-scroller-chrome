import Scroller from "./scroller"

function getStore(): Promise<StoreResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SCROLLER_SETTING" }, resolve)
  })
}

export const scroller = new Scroller()

// notify this tab
chrome.runtime.sendMessage({ type: "CONNECT" })

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   // UserSettings has both enabled and options.
//   // TODO: compare to get which is changed
//   // figure out which value is changed by comparing

//   const newUserSetting: UserSettings = changes["USER_SETTINGS"]
//   //   ? changes["USER_SETTING"].newValue
//   //   : null

//   const fakeIsEnabledChanged = true
//   const fakeNewEnabled = true

//   if (newUserSetting) {
//     scroller.setActivation(newUserSetting.userOption.scroller.activation)
//     // only mouse event's are attached for now.
//     // so no detaching old Listener
//   } else if (fakeIsEnabledChanged) {
//     fakeNewEnabled ? scroller.enable() : scroller.disable()
//   }
// })

/**
 * update for storage.onChange any of [ScrollerConfig]
 * //TODO: [LATER] impl. this instead of storage.onChange here.
 */
// chrome.runtime.onMessage.addListener((msg) => {
//   switch (msg) {
//     case "STORAGE_CHANGE":
//       scroller.isConfigUpdated = true
//       break
//   }
// })

getStore().then(({ enabled, scrollerConfig }) => {
  scroller.setConfig(scrollerConfig)
  if (enabled) {
    scroller.enable()
  }
})

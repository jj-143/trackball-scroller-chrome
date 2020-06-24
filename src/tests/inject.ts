import Scroller from "../scroller"

interface ScrollerConfig {
  option: ScrollerOption
  enabled: boolean
}

function getStore(): Promise<ScrollerConfig> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage("GET_SCROLLER_OPTION", ({ option, enabled }) => {
      console.log("inject: ", option)
      resolve({
        option,
        enabled,
      })
    })
  })
}

let scroller = new Scroller()

// notify this tab
chrome.runtime.sendMessage("CONNECT")

chrome.storage.onChanged.addListener((changes, namespace) => {
  // UserSettings has both enabled and options.
  // TODO: compare to get which is changed
  // figure out which value is changed by comparing

  const newUserSetting: UserSettings = changes["USER_SETTINGS"]
  //   ? changes["USER_SETTING"].newValue
  //   : null

  const fakeIsEnabledChanged = true
  const fakeNewEnabled = true

  if (newUserSetting) {
    scroller.setActivation(newUserSetting.userOption.scroller.activation)
    // only mouse event's are attached for now.
    // so no detaching old Listener
  } else if (fakeIsEnabledChanged) {
    fakeNewEnabled ? scroller.enable() : scroller.disable()
  }
})

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

getStore().then(({ option, enabled }) => {
  scroller.setActivation(option.activation)
  if (enabled) {
    scroller.enable()
    console.log(scroller)
  }
})

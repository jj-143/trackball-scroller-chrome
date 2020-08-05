import { saveSettings, getSettings, formatActivation } from "./utils/utils"
import { updateDOM, makeTestArticles, attachEvents } from "./utils/page"
import { scroller } from "../inject"
import Scroller from "../scroller"

let settings: UserSettings

// Bypass trigger on the "customize activation" button
scroller.checkTrigger = function (e: MouseEvent) {
  const elm = e.target as Element
  const originalFn = Scroller.prototype.checkTrigger.bind(scroller)
  if (elm.classList.contains("activation")) {
    return
  }
  return originalFn(e)
}

function handleOptionUpdate({ detail: { type, payload } }: CustomEvent) {
  const newSettings: UserSettings = JSON.parse(JSON.stringify(settings))

  switch (type) {
    case "ACTIVATION":
      // note: activation = combo + nonActivation (v1.0.0)
      newSettings.userOption.scroller.activation = {
        ...newSettings.userOption.scroller.activation,
        ...payload,
      }

      // same activation: revert to original
      if (
        formatActivation(newSettings.userOption.scroller.activation) ===
        formatActivation(settings.userOption.scroller.activation)
      ) {
        return updateDOM(settings)
      }
      break
    case "NON_ACTIVATION":
      newSettings.userOption.scroller.activation.nonActivation = {
        ...newSettings.userOption.scroller.activation.nonActivation,
        ...payload,
      }
      break
    case "SCROLLER_OPTION":
      newSettings.userOption.scroller = {
        ...newSettings.userOption.scroller,
        ...payload,
      }
      break
    case "SENSITIVITY":
      const newSensitivity =
        newSettings.userOption.scroller.sensitivity + payload
      if (newSensitivity < 1 || newSensitivity > 20) return
      newSettings.userOption.scroller.sensitivity = newSensitivity
      break
  }
  saveSettings(newSettings)
}

document.addEventListener("UPDATE_OPTION", handleOptionUpdate)

document.addEventListener("CANCEL_CUSTOMIZE_ACTIVATION", () => {
  updateDOM(settings)
})

// some setting changes ("enabled" via Browser Action)
// might not from option page.
// so handle both from Background Page's Event
// triggered by [chrome.storage.onChanged]
function updateSetting(storeResponse: StoreResponse) {
  let { enabled, scrollerConfig } = storeResponse
  settings.enabled = enabled
  settings.userOption.scroller = scrollerConfig
  updateDOM(settings)
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  switch (msg.type) {
    case "UPDATE_SETTING":
      updateSetting(msg.storeResponse)
      break
  }
})

makeTestArticles()
attachEvents()
getSettings().then((settings_) => {
  settings = settings_
  updateDOM(settings)
})

import { saveSettings, getSettings } from "./utils/utils"
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
  const newSettings = JSON.parse(JSON.stringify(settings))
  switch (type) {
    case "ACTIVATION":
      // note: activation = combo + nonActivation (v1.0.0)
      newSettings.userOption.scroller.activation = {
        ...newSettings.userOption.scroller.activation,
        ...payload,
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
  saveSettings(newSettings).then(() => {
    settings = newSettings
    updateDOM(newSettings)
  })
}

document.addEventListener("UPDATE_OPTION", handleOptionUpdate)

document.addEventListener("CANCEL_CUSTOMIZE_ACTIVATION", () => {
  updateDOM(settings)
})

makeTestArticles()
attachEvents()
getSettings().then((settings_) => {
  settings = settings_
  updateDOM(settings)
})

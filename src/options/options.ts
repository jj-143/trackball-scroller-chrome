import { saveSettings, getSettings } from "./utils/utils"
import { updateDOM, makeTestArticles, attachEvents } from "./utils/page"
import { scroller } from "../inject"
import Scroller from "../scroller"

let settings: UserSettings

// disable trigger on cusomize activation Button
scroller.checkTrigger = function (e: MouseEvent) {
  const elm = e.target as Element
  const originalFn = Scroller.prototype.checkTrigger.bind(scroller)
  if (elm.classList.contains("activation")) {
    return
  }
  return originalFn(e)
}

// Maybe combine 'update events' to one
document.addEventListener(
  // only updating "combo" part.
  // TODO:
  // Activation is actually combo + nonActivation.
  // maybe move to setting.userOption.scroller
  "UPDATE_ACTIVATION",
  ({ detail: combo }: CustomEvent) => {
    const newSettings = { ...settings }
    newSettings.userOption.scroller.activation = {
      ...newSettings.userOption.scroller.activation,
      ...combo,
    }

    saveSettings(newSettings).then(() => {
      settings = newSettings
      updateDOM(newSettings)
    })
  }
)

document.addEventListener(
  "UPDATE_NON_ACTIVATION",
  ({ detail: { key, value } }: CustomEvent) => {
    const newSettings = { ...settings }
    newSettings.userOption.scroller.activation.nonActivation[key] = value

    saveSettings(newSettings).then(() => {
      settings = newSettings
      updateDOM(newSettings)
    })
  }
)

document.addEventListener(
  "UPDATE_CHECKBOX",
  ({ detail: { key, value } }: CustomEvent) => {
    const newSettings = { ...settings }
    newSettings.userOption.scroller[key] = value

    saveSettings(newSettings).then(() => {
      settings = newSettings
      updateDOM(newSettings)
    })
  }
)

document.addEventListener(
  "UPDATE_SENSITIVITY",
  ({ detail: sensitivity }: CustomEvent) => {
    const newSettings = { ...settings }
    const newSensitivity =
      newSettings.userOption.scroller.sensitivity + sensitivity

    if (newSensitivity >= 1 && newSensitivity <= 20) {
      newSettings.userOption.scroller.sensitivity = newSensitivity
    }

    saveSettings(newSettings).then(() => {
      settings = newSettings
      updateDOM(newSettings)
    })
  }
)

document.addEventListener("CANCEL_CUSTOMIZE_ACTIVATION", () => {
  updateDOM(settings)
})

makeTestArticles()
attachEvents()
getSettings().then((settings_) => {
  settings = settings_
  updateDOM(settings)
})

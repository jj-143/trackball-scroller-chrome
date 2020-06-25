import { formatActivation } from "./utils"

const OPTION_KEYS = ["naturalScrolling"]

export function updateDOM(setting: UserSettings) {
  const activation = document.querySelector("button.activation")

  // Activation
  activation.textContent = formatActivation(
    setting.userOption.scroller.activation
  )

  // Non Activation
  Object.entries(setting.userOption.scroller.activation.nonActivation)
    .filter(([_, v]) => v)
    .forEach(([key, _]) => {
      ;(document.querySelector(
        "#non-activation input[name=" + key + "]"
      ) as HTMLInputElement).checked = true
    })

  // Sensitivity
  document.getElementById(
    "sensitivity-value"
  ).textContent = setting.userOption.scroller.sensitivity.toString()
  // TODO: it was "sensitivity Step"

  // Checkboxes
  OPTION_KEYS.forEach((key) => {
    ;(document.querySelector(
      "input[type=checkbox][name=" + key + "]"
    ) as HTMLInputElement).checked = setting.userOption.scroller[key]
  })

  // TODO: MOUSE 3 warning
}

import { formatActivation } from "./utils"

const OPTION_KEYS = ["naturalScrolling"]

export function updateDOM(setting: UserSettings) {
  const activation = document.querySelector("button.activation")

  // Activation
  activation.textContent = formatActivation(
    setting.userOption.scroller.activation
  )

  // Non Activation
  Object.entries(setting.userOption.scroller.activation.nonActivation).forEach(
    ([k, v]) => {
      ;(document.querySelector(
        "#non-activation input[name=" + k + "]"
      ) as HTMLInputElement).checked = v
    }
  )

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

export function makeTestArticles() {
  const context = document.getElementById("test-context")
  for (var i = 0; i < 60; i++) {
    var h = document.createElement("h2")
    var p = document.createElement("p")
    h.textContent = "Article " + (i + 1)
    p.textContent =
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, cumque? Ea facilis velit accusantium error sapiente doloribus iure qui suscipit sunt, itaque non veniam ex harum assumenda praesentium magnam. Perferendis?"
    context.appendChild(h)
    context.appendChild(p)
  }
}

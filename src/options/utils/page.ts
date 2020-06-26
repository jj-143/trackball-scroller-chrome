import { formatActivation } from "./utils"
import { parseMouseInput } from "../../scroller/utils/parseInput"
import {
  allowContextMenu,
  preventContextMenu,
} from "../../scroller/utils/utils"

const OPTION_KEYS = ["naturalScrolling"]
const MODIFIERS = ["Control", "Alt", "Shift", "Meta"]

function isMouse3Alone(activation: Activation) {
  // added: no warning after checking non-activation
  return (
    Object.values(activation.modifiers).filter((_) => _).length === 0 &&
    activation.type === "mouse" &&
    activation.button === 2 &&
    Object.values(activation.nonActivation).filter((_) => _).length === 0
  )
}

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

  // Checkboxes
  OPTION_KEYS.forEach((key) => {
    ;(document.querySelector(
      "input[type=checkbox][name=" + key + "]"
    ) as HTMLInputElement).checked = setting.userOption.scroller[key]
  })

  // Mouse 3 warning
  if (isMouse3Alone(setting.userOption.scroller.activation)) {
    document.querySelector(".option#activation").classList.add("warning-mouse3")
  } else {
    document
      .querySelector(".option#activation")
      .classList.remove("warning-mouse3")
  }
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

function attachNonActivationHandler() {
  document.querySelector("#non-activation").addEventListener("change", (e) => {
    const chip = e.target as HTMLInputElement
    document.dispatchEvent(
      new CustomEvent("UPDATE_NON_ACTIVATION", {
        detail: {
          key: chip.name,
          value: chip.checked,
        },
      })
    )
  })
}

function attachCheckboxHandler() {
  document.querySelector("#checkboxes").addEventListener("change", (e) => {
    const checkbox = e.target as HTMLInputElement
    document.dispatchEvent(
      new CustomEvent("UPDATE_CHECKBOX", {
        detail: {
          key: checkbox.name,
          value: checkbox.checked,
        },
      })
    )
  })
}

function onPointerLockChange() {
  if (!document.pointerLockElement) {
    document.removeEventListener("pointerlockchange", onPointerLockChange)
    stopCustomizeActivation()
    document.dispatchEvent(new CustomEvent("CANCEL_CUSTOMIZE_ACTIVATION"))
    // btnActivation.textContent = formatActivation(storageSetting.activation)
  }
}

function handleMouseActivation(e) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  // ignore pressing only modifier key
  if (e.type === "keydown" && MODIFIERS.includes(e.key)) return

  // ignore esc - handled by PointerLock (this function might already be canceled)
  if (e.key === "Escape") return

  let combo: Combo = parseMouseInput(e)


  stopCustomizeActivation()

  document.dispatchEvent(
    new CustomEvent("UPDATE_ACTIVATION", {
      detail: combo,
    })
  )
}

function startCustomizeActivation() {
  const btnActivation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  btnActivation.disabled = true
  document.body.requestPointerLock()

  btnActivation.innerText = "hit combo"
  btnActivation.classList.add("editing")

  preventContextMenu()
  addEventListener("pointerlockchange", onPointerLockChange)
  addEventListener("mousedown", handleMouseActivation, true)
}

function stopCustomizeActivation() {
  document.exitPointerLock()
  const btnActivation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  allowContextMenu()
  removeEventListener("pointerlockchange", onPointerLockChange)
  removeEventListener("mousedown", handleMouseActivation, true)

  btnActivation.disabled = false
  btnActivation.classList.remove("editing")
}

function attachActivationHandler() {
  const btnActivation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  btnActivation.addEventListener("click", (e) => {
    startCustomizeActivation()
  })
}

function attachSensitivityHandler() {
  document
    .querySelector("#option-sensitivity")
    .addEventListener("click", (e) => {
      const button = e.target as HTMLInputElement
      const step = parseInt(button.value)

      document.dispatchEvent(
        new CustomEvent("UPDATE_SENSITIVITY", {
          detail: step,
        })
      )
      return
    })
}

export function attachEvents() {
  attachActivationHandler()
  attachNonActivationHandler()
  attachCheckboxHandler()
  attachSensitivityHandler()
}

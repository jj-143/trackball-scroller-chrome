import { formatActivation, isOnlyMouse3, Payload } from "./utils"
import { parseInput } from "../../scroller/utils/parseInput"
import {
  allowContextMenu,
  preventContextMenu,
} from "../../scroller/utils/utils"

const OPTION_KEYS = ["naturalScrolling"]

// Temporary fix for circular dependencies between
// options.ts and page.ts until migration with a
// small UI library

const context: Context = {}

type Context = {
  updateOption?: <T extends keyof Payload>(type: T, payload: Payload[T]) => void
  cancelCustomizeActivation?: () => void
}

export function setContext(ctx: Context) {
  context.cancelCustomizeActivation = ctx.cancelCustomizeActivation
  context.updateOption = ctx.updateOption
}

// END of temporary fix

function attachNonActivationHandler() {
  document.querySelector("#non-activation")?.addEventListener("change", (e) => {
    const chip = e.target as HTMLInputElement
    context.updateOption?.("NON_ACTIVATION", {
      [chip.name]: chip.checked,
    })
  })
}

function attachCheckboxHandler() {
  document.querySelector("#checkboxes")?.addEventListener("change", (e) => {
    const checkbox = e.target as HTMLInputElement
    context.updateOption?.("SCROLLER_OPTION", {
      [checkbox.name]: checkbox.checked,
    })
  })
}

function onPointerLockChange() {
  if (!document.pointerLockElement) {
    document.removeEventListener("pointerlockchange", onPointerLockChange)
    stopCustomizeActivation()
    context.cancelCustomizeActivation?.()
  }
}

function handleComboInput(e: MouseEvent | KeyboardEvent) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const combo = parseInput(e)
  if (!combo) return
  stopCustomizeActivation()
  context.updateOption?.("ACTIVATION", combo)
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
  document.addEventListener("pointerlockchange", onPointerLockChange)
  document.addEventListener("mousedown", handleComboInput, true)
  document.addEventListener("keydown", handleComboInput, true)
}

function stopCustomizeActivation() {
  document.exitPointerLock()
  const btnActivation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  allowContextMenu()
  document.removeEventListener("pointerlockchange", onPointerLockChange)
  document.removeEventListener("mousedown", handleComboInput, true)
  document.removeEventListener("keydown", handleComboInput, true)

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
    ?.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).tagName !== "BUTTON") return
      const button = e.target as HTMLInputElement
      const step = parseInt(button.value)

      context.updateOption?.("SENSITIVITY", step)
    })
}

export function attachEvents() {
  attachActivationHandler()
  attachNonActivationHandler()
  attachCheckboxHandler()
  attachSensitivityHandler()
}

export function updateDOM(setting: UserSettings) {
  const activation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  // Activation
  activation.textContent = formatActivation(
    setting.userOption.scroller.activation
  )

  // Non Activation
  Object.entries(setting.userOption.scroller.activation.nonActivation).forEach(
    ([k, v]) => {
      const checkbox = document.querySelector(
        "#non-activation input[name=" + k + "]"
      ) as HTMLInputElement
      checkbox.checked = v
    }
  )

  // Sensitivity
  ;(document.getElementById("sensitivity-value") as HTMLElement).textContent =
    setting.userOption.scroller.sensitivity.toString()

  // Checkboxes
  OPTION_KEYS.forEach((key) => {
    const checkbox = document.querySelector(
      "input[type=checkbox][name=" + key + "]"
    ) as HTMLInputElement
    checkbox.checked =
      setting.userOption.scroller[
        key as keyof Omit<ScrollerConfig, "activation" | "sensitivity">
      ]
  })

  // Mouse 3 warning
  if (isOnlyMouse3(setting.userOption.scroller.activation)) {
    document
      .querySelector(".option#activation")
      ?.classList.add("warning-mouse3")
  } else {
    document
      .querySelector(".option#activation")
      ?.classList.remove("warning-mouse3")
  }
}

export function makeTestArticles() {
  const container = document.getElementById(
    "test-article-container"
  ) as HTMLElement

  for (let i = 0; i < 60; i++) {
    const article = document.createElement("article")
    article.classList.add("test-article")
    const h = document.createElement("h2")
    const p = document.createElement("p")
    h.textContent = `Article (${Math.floor(i / 3) + 1}, ${(i % 3) + 1})`
    p.textContent =
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, cumque? Ea facilis velit accusantium error sapiente doloribus iure qui suscipit sunt, itaque non veniam ex harum assumenda praesentium magnam. Perferendis?"
    article.appendChild(h)
    article.appendChild(p)
    article.appendChild(p.cloneNode(true))
    article.appendChild(p.cloneNode(true))
    container.appendChild(article)
  }
}

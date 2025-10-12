import { formatActivation, isOnlyMouse3, type Payload } from "./utils"
import { parseInput } from "../../../scroller/utils/parseInput"
import {
  allowContextMenu,
  preventContextMenu,
} from "../../../scroller/utils/utils"

export const context: Context = {}

type Context = {
  updateOption?: <T extends keyof Payload>(type: T, payload: Payload[T]) => void
  cancelCustomizeActivation?: () => void
}

export function setContext(ctx: Context) {
  context.cancelCustomizeActivation = ctx.cancelCustomizeActivation
  context.updateOption = ctx.updateOption
}

// END of temporary fix
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

export function attachEvents() {
  attachActivationHandler()
}

export function updateDOM(setting: UserSettings) {
  const activation = document.querySelector(
    "button.activation"
  ) as HTMLButtonElement

  // Activation
  activation.textContent = formatActivation(
    setting.userOption.scroller.activation
  )
}

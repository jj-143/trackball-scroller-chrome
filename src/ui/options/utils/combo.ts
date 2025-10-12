import { parseInput } from "@/scroller/utils/parseInput"
import { allowContextMenu, preventContextMenu } from "@/scroller/utils/utils"

const MODIFIER_ORDER = ["ctrl", "alt", "shift", "meta"]
const MODIFIER_FORMAT_MAP: Record<keyof ModifierFlag, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  meta: "Meta",
}

export default class CustomizeCombo {
  private result?: Promise<Combo>
  private resolve?: (combo: Combo) => void
  private reject?: () => void

  start(): Promise<Combo> {
    document.body.requestPointerLock()

    preventContextMenu()

    document.addEventListener("pointerlockchange", this.onPointerLockChange)
    document.addEventListener("mousedown", this.onUserComboComplete, true)
    document.addEventListener("keydown", this.onUserComboComplete, true)

    this.result = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })

    return this.result
  }

  private cleanup() {
    document.exitPointerLock()

    allowContextMenu()
    document.removeEventListener("pointerlockchange", this.onPointerLockChange)
    document.removeEventListener("mousedown", this.onUserComboComplete, true)
    document.removeEventListener("keydown", this.onUserComboComplete, true)
  }

  private onUserComboComplete = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()

    const combo = parseInput(e)
    if (!combo) return
    this.cleanup()
    this.resolve?.(combo)
  }

  private onPointerLockChange = () => {
    if (!document.pointerLockElement) {
      document.removeEventListener(
        "pointerlockchange",
        this.onPointerLockChange
      )
      this.cleanup()
      this.reject?.()
    }
  }
}

export function formatCombo(combo: Combo): string {
  const button =
    combo.type === "mouse"
      ? `Mouse ${(combo.button as number) + 1}`
      : `${combo.button.toString().toUpperCase()}`
  const modifiers = Object.entries(combo.modifiers)
    .filter(([, value]) => value)
    .sort(
      ([mod1], [mod2]) =>
        MODIFIER_ORDER.findIndex((it) => it === mod1) -
        MODIFIER_ORDER.findIndex((it) => it === mod2)
    )
    .map(([mod]) => MODIFIER_FORMAT_MAP[mod as keyof ModifierFlag])
  return modifiers.concat(button).join(" + ")
}

export function equalsCombo(c1: Combo, c2: Combo) {
  return formatCombo(c1) == formatCombo(c2)
}

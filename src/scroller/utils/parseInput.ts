const MODS: (keyof ModifierFlag)[] = ["ctrl", "alt", "shift", "meta"]
const MODIFIERS_FULL = ["Control", "Alt", "Shift", "Meta"]

export function parseInput(e: MouseEvent | KeyboardEvent): Combo | null {
  const isMouse = e.type.startsWith("mouse")
  const type = isMouse ? "mouse" : "keyboard"
  const button = isMouse ? (e as MouseEvent).button : (e as KeyboardEvent).key
  const modifiers: ModifierFlag = {}

  if (
    (!isMouse && button === "Escape") ||
    // discard keydown of modifier key itself alone
    MODIFIERS_FULL.includes(button as string)
  ) {
    return null
  }

  MODS.forEach((mod) => {
    modifiers[mod] = e[`${mod}Key`]
  })

  return {
    type,
    button,
    modifiers,
  }
}

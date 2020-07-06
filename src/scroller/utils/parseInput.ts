const MODS = ["ctrl", "alt", "shift", "meta"]
const MODIFIERS_FULL = ["Control", "Alt", "Shift", "Meta"]

export function parseInput(e: MouseEvent | KeyboardEvent): Combo {
  const isMouse = e.type.startsWith("mouse")
  const type = isMouse ? "mouse" : "keyboard"
  const button = isMouse ? (e as MouseEvent).button : (e as KeyboardEvent).key
  const modifiers = {}

  if (
    (!isMouse && button === "Escape") ||
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

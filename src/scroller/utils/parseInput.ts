const MODS = ["ctrl", "alt", "shift", "meta"]

export function parseMouseInput(e): Combo {
  const modifiers = {}
  MODS.forEach((mod) => {
    modifiers[mod] = e[`${mod}Key`]
  })
  return {
    type: "mouse",
    button: e.button,
    modifiers,
  }
}

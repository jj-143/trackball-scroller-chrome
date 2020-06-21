const MODS = ["ctrl", "alt", "shift", "meta"]

export function parseMouseInput(e) {
  const mods = new Set(MODS.filter((mod) => e[`${mod}Key`]))
  return {
    type: "mouse",
    button: e.button,
    mods,
  }
}

export function preventDefault(e) {
  e.preventDefault()
}

export function preventContextMenu() {
  addEventListener("contextmenu", preventDefault, true)
}

export function allowContextMenu() {
  removeEventListener("contextmenu", preventDefault, true)
}

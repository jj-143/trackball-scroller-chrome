import { parseMouseInput } from "./utils/parseInput"

export default class Scroller {
  // TODO: method for setting activation
  constructor() {
    this.isEnabled = false
    this.isActivated = false
    this.activation = {
      type: "mouse",
      button: 1,
      mods: new Set(),
      nonActivation: new Set(),
    }
    this.scrollTarget = null

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClickCancel = this.handleClickCancel.bind(this)
  }

  enable() {
    // if it has some side-effect thing,
    // it needs to check [isEnabled] first.
    // same with [disable()]
    this.isEnabled = true
    document.addEventListener("mousedown", this.handleMouseDown)
  }
  disable() {
    // should it deactivate also?
    // in order to disable it by Action Button (currently only way),
    // need a mouse to do it. Or there's a way to do it so clean up here.

    // [check needed.]
    // this is just internal "disable state" but disabling in
    // browser's extension manager and then enabling it probably
    // restart the whole app (including background.js)

    this.deactivate()
    this.isEnabled = false
  }

  activate() {
    if (this.isEnabled) {
      this.isActivated = true
      document.removeEventListener("mousedown", this.handleMouseDown)
      document.addEventListener("mousedown", this.handleClickCancel)
      document.addEventListener("mousemove", this.handleMouseMove)
    }
  }
  deactivate() {
    this.isActivated = false
    // document.exitPointerLock()

    document.addEventListener("mousedown", this.handleMouseDown)
    document.removeEventListener("mousedown", this.handleClickCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
  }

  matchCombo(combo) {
    return (
      this.activation.type === combo.type &&
      this.activation.button === combo.button &&
      Array.from(this.activation.mods.keys()).every((mod) =>
        combo.mods.has(mod)
      ) &&
      Array.from(this.activation.nonActivation.keys()).every(
        (mod) => !combo.mods.has(mod)
      )
    )
  }

  handleMouseDown(e) {
    const combo = parseMouseInput(e)
    const matched = this.matchCombo(combo)

    if (matched) {
      this.activate()
    }
  }

  handleMouseMove(e) {
    this.scrollTarget = document.documentElement
    if (this.scrollTarget) {
      const dy = e.movementY * -1
      this.scrollTarget.scrollBy(0, dy)
    }
  }
  handleClickCancel(e) {
    if (this.isActivated) {
      this.deactivate()
    }
  }
}

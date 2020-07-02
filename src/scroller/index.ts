/// <reference path="../definitions.d.ts" />
import { parseMouseInput } from "./utils/parseInput"
import { isFromAnchor } from "./utils/isFromAnchor"
import { findTarget } from "./utils/findTarget"
import { preventContextMenu, allowContextMenu } from "./utils/utils"
import { calcMultiplier } from "./utils/sensitivityToValue"

export default class Scroller {
  config: ScrollerConfig

  // state
  isEnabled: boolean
  isActivated: boolean
  scrollTarget: Element
  isConfigUpdated: boolean

  constructor() {
    this.config = null

    // state
    this.isEnabled = false
    this.isActivated = false
    this.scrollTarget = null
    this.isConfigUpdated = false

    this.checkTrigger = this.checkTrigger.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClickCancel = this.handleClickCancel.bind(this)
    this.pointerLockChange = this.pointerLockChange.bind(this)
    this.pointerLockError = this.pointerLockError.bind(this)
  }

  setConfig(config: ScrollerConfig) {
    this.config = config
  }

  enable() {
    if (this.isEnabled) return
    this.isEnabled = true
    document.addEventListener("mousedown", this.checkTrigger)
    document.addEventListener("pointerlockchange", this.pointerLockChange)
    document.addEventListener("pointerlockerror", this.pointerLockError)
  }

  disable() {
    if (!this.isEnabled) return
    this.deactivate()
    document.removeEventListener("mousedown", this.checkTrigger)
    document.removeEventListener("pointerlockchange", this.pointerLockChange)
    document.removeEventListener("pointerlockerror", this.pointerLockError)
    this.isEnabled = false
  }

  activate() {
    preventContextMenu()
    if (this.isEnabled && !this.isActivated) {
      this.isActivated = true
      document.documentElement.requestPointerLock()
    }
  }

  deactivate() {
    if (this.isActivated) {
      this.isActivated = false
      document.exitPointerLock()
    }
  }

  onActivated() {
    document.removeEventListener("mousedown", this.checkTrigger)
    document.addEventListener("mousedown", this.handleClickCancel)
    document.addEventListener("mousemove", this.handleMouseMove)
  }

  onDeactivated() {
    allowContextMenu()
    document.addEventListener("mousedown", this.checkTrigger)
    document.removeEventListener("mousedown", this.handleClickCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
  }

  pointerLockChange() {
    if (document.pointerLockElement) {
      if (this.isActivated) {
        // normal activation
        this.onActivated()
      }
    } else {
      if (this.isActivated) {
        // lost PointerLock by ESC, window losing focus
        this.isActivated = false
      }
      // normal deactivation
      this.onDeactivated()
    }
  }

  // sandboxed iframe prevents using PointerLock (e.g. Yahoo)
  pointerLockError() {
    // manual call since pointerLockChange never called when errored
    this.onDeactivated()
    this.disable()
  }

  matchCombo(combo: Combo) {
    return (
      this.config.activation.type === combo.type &&
      this.config.activation.button === combo.button &&
      Object.entries(this.config.activation.modifiers)
        .filter(([_, mod]) => mod)
        .every(([key, _]) => combo.modifiers[key]) &&
      Object.entries(this.config.activation.nonActivation)
        .filter(([_, mod]) => mod)
        .every(([key, _]) => !combo.modifiers[key])
    )
  }

  checkTrigger(e: MouseEvent) {
    const combo = parseMouseInput(e)
    const matched = this.matchCombo(combo)
    if (!matched) return

    const path = e.composedPath()
    if (isFromAnchor(path)) return

    // need both to work without any erratic behaviors
    e.preventDefault()
    e.stopPropagation()

    this.scrollTarget = findTarget(path)
    this.activate()
  }

  handleMouseMove(e) {
    if (this.scrollTarget) {
      const dy =
        e.movementY *
        (this.config.naturalScrolling ? -1 : 1) *
        calcMultiplier(this.config.sensitivity)
      this.scrollTarget.scrollBy(0, dy)
    }
  }

  handleClickCancel() {
    if (this.isActivated) {
      this.deactivate()
    }
  }
}

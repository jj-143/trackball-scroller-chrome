/// <reference path="../definitions.d.ts" />
import { parseInput } from "./utils/parseInput"
import { findTarget } from "./utils/findTarget"
import {
  preventContextMenu,
  allowContextMenu,
  stripSmoothScroll,
  revertSmoothScroll,
} from "./utils/utils"
import { calcMultiplier } from "./utils/sensitivityToValue"

export default class Scroller {
  config: ScrollerConfig

  // state
  isEnabled: boolean
  isActivated: boolean
  scrollTarget: ScrollTarget
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
    this.handleKeyComboCancel = this.handleKeyComboCancel.bind(this)
  }

  setConfig(config: ScrollerConfig) {
    this.config = config
  }

  updateConfig(config: ScrollerConfig) {
    if (
      this.isEnabled &&
      config.activation.type !== this.config.activation.type
    ) {
      this.detachTrigger(this.config.activation.type)
      this.attachTrigger(config.activation.type)
    }
    this.setConfig(config)
  }

  enable() {
    // it's not convenient but [setConfig] must be called before
    // enabling scroller: it attaches trigger based on the trigger type.
    // the term "enable", "disable" might not be the best choice;
    // it's more of "listen to trigger event"
    if (this.isEnabled) return
    this.isEnabled = true
    this.attachTrigger()
    document.addEventListener("pointerlockchange", this.pointerLockChange)
    document.addEventListener("pointerlockerror", this.pointerLockError)
  }

  disable() {
    if (!this.isEnabled) return
    this.isEnabled = false
    this.deactivate()
    this.detachTrigger()
    document.removeEventListener("pointerlockchange", this.pointerLockChange)
    document.removeEventListener("pointerlockerror", this.pointerLockError)
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
    this.detachTrigger()
    stripSmoothScroll(this.scrollTarget)
    document.addEventListener("mousedown", this.handleClickCancel)
    document.addEventListener("keydown", this.handleKeyComboCancel)
    document.addEventListener("mousemove", this.handleMouseMove)
  }

  onDeactivated() {
    allowContextMenu()
    revertSmoothScroll()
    this.isEnabled && this.attachTrigger()
    document.removeEventListener("mousedown", this.handleClickCancel)
    document.removeEventListener("keydown", this.handleKeyComboCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
  }

  attachTrigger(type: "mouse" | "keyboard" | void) {
    if (type === undefined) {
      type = this.config.activation.type
    }

    if (type === "mouse") {
      document.addEventListener("mousedown", this.checkTrigger)
    } else {
      document.addEventListener("keydown", this.checkTrigger)
    }
  }

  detachTrigger(type: "mouse" | "keyboard" | void) {
    if (type === undefined) {
      type = this.config.activation.type
    }

    if (type === "mouse") {
      document.removeEventListener("mousedown", this.checkTrigger)
    } else {
      document.removeEventListener("keydown", this.checkTrigger)
    }
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
      combo &&
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

  checkTrigger(e: MouseEvent | KeyboardEvent) {
    const combo = parseInput(e)
    const matched = this.matchCombo(combo)
    if (!matched) return

    const target = findTarget(e)
    if (!target) return

    this.scrollTarget = target
    e.preventDefault()
    e.stopPropagation()
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

  handleKeyComboCancel(e) {
    const combo = parseInput(e)
    this.matchCombo(combo) && this.deactivate()
  }
}

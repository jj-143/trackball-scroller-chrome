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
  }

  setConfig(config: ScrollerConfig) {
    this.config = config
  }

  enable() {
    // if it has some side-effect thing,
    // it needs to check [isEnabled] first.
    // same with [disable()]
    this.isEnabled = true
    document.addEventListener("mousedown", this.checkTrigger)
  }
  disable() {
    this.deactivate()
    document.removeEventListener("mousedown", this.checkTrigger)
    this.isEnabled = false
  }

  activate() {
    if (this.isEnabled) {
      this.isActivated = true
      document.documentElement.requestPointerLock()
      preventContextMenu()
      document.removeEventListener("mousedown", this.checkTrigger)
      document.addEventListener("mousedown", this.handleClickCancel)
      document.addEventListener("mousemove", this.handleMouseMove)
    }
  }

  deactivate() {
    this.isActivated = false
    document.exitPointerLock()
    allowContextMenu()
    document.addEventListener("mousedown", this.checkTrigger)
    document.removeEventListener("mousedown", this.handleClickCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
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
    if (this.isConfigUpdated) {
      // should test speed
      //TODO: how to call get new config??
      // `inject.ts` should be manage this..
    }

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
    // handles losing PointerLock.
    // `document.pointerLockElement === null`
    // when user hit ESC / focus moved to other window / tab
    if (!document.pointerLockElement && this.isActivated) {
      return this.deactivate()
    }
    if (this.scrollTarget) {
      const dy =
        e.movementY *
        (this.config.naturalScrolling ? -1 : 1) *
        calcMultiplier(this.config.sensitivity)
      this.scrollTarget.scrollBy(0, dy)
    }
  }
  handleClickCancel(e) {
    if (this.isActivated) {
      this.deactivate()
    }
  }
}

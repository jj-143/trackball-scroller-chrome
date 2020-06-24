/// <reference path="../definitions.d.ts" />
import { parseMouseInput } from "./utils/parseInput"

export default class Scroller {
  isEnabled: boolean
  isActivated: boolean
  activation: Activation
  scrollTarget: HTMLElement
  isConfigUpdated: boolean

  constructor() {
    this.isEnabled = false
    this.isActivated = false
    this.activation = null
    this.scrollTarget = null
    this.isConfigUpdated = false
    this.checkTrigger = this.checkTrigger.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClickCancel = this.handleClickCancel.bind(this)
  }

  setActivation(activation: Activation) {
    this.activation = activation
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
      document.removeEventListener("mousedown", this.checkTrigger)
      document.addEventListener("mousedown", this.handleClickCancel)
      document.addEventListener("mousemove", this.handleMouseMove)
    }
  }

  deactivate() {
    this.isActivated = false
    document.exitPointerLock()
    document.addEventListener("mousedown", this.checkTrigger)
    document.removeEventListener("mousedown", this.handleClickCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
  }

  matchCombo(combo: Combo) {
    return (
      this.activation.type === combo.type &&
      this.activation.button === combo.button &&
      Object.entries(this.activation.modifiers)
        .filter(([_, mod]) => mod)
        .every(([key, _]) => combo.modifiers[key]) &&
      Object.entries(this.activation.nonActivation)
        .filter(([_, mod]) => mod)
        .every(([key, _]) => !combo.modifiers[key])
    )
  }

  checkTrigger(e) {
    if (this.isConfigUpdated) {
      // should test speed
      //TODO: how to call get new config??
      // `inject.ts` should be manage this..
    }

    const combo = parseMouseInput(e)
    const matched = this.matchCombo(combo)

    if (matched) {
      this.activate()
    }
  }

  handleMouseMove(e) {
    // handles losing PointerLock.
    // `document.pointerLockElement === null`
    // when user hit ESC / focus moved to other window / tab
    if (!document.pointerLockElement && this.isActivated) {
      return this.deactivate()
    }
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

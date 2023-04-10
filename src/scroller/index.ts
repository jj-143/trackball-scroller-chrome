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
  config?: ScrollerConfig

  // state
  #isInitialized: boolean
  isEnabled: boolean
  isActivated: boolean
  scrollTarget: ScrollTarget | null
  preventClickCancelOnce: boolean

  constructor() {
    this.preventClickCancelOnce = false

    // state
    this.#isInitialized = false
    this.isEnabled = false
    this.isActivated = false
    this.scrollTarget = null

    this.checkTrigger = this.checkTrigger.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClickCancel = this.handleClickCancel.bind(this)
    this.pointerLockChange = this.pointerLockChange.bind(this)
    this.pointerLockError = this.pointerLockError.bind(this)
    this.handleKeyComboCancel = this.handleKeyComboCancel.bind(this)
  }

  init(config: ScrollerConfig) {
    this.setConfig(config)
    this.#isInitialized = true
  }

  checkInitialized(): asserts this is { config: ScrollerConfig } {
    if (!this.#isInitialized) {
      throw Error("Scroller's not initialized")
    }
  }

  setConfig(config: ScrollerConfig) {
    this.config = config
  }

  updateConfig(config: ScrollerConfig) {
    this.checkInitialized()
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
    this.preventClickCancelOnce = true
    stripSmoothScroll(this.scrollTarget)

    // in "PointerLocked", any button click emits 'click' event
    document.addEventListener("click", this.handleClickCancel)
    document.addEventListener("keydown", this.handleKeyComboCancel)
    document.addEventListener("mousemove", this.handleMouseMove)
  }

  // NOTE: multiple call results to same result as one call
  onDeactivated() {
    allowContextMenu()
    revertSmoothScroll()
    this.isEnabled && this.attachTrigger()
    document.removeEventListener("click", this.handleClickCancel)
    document.removeEventListener("keydown", this.handleKeyComboCancel)
    document.removeEventListener("mousemove", this.handleMouseMove)
  }

  attachTrigger(type: "mouse" | "keyboard" | void) {
    this.checkInitialized()

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
    this.checkInitialized()

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
        // lost PointerLock by ESC or window losing focus
        this.isActivated = false
      }
      // normal deactivation
      this.onDeactivated()
    }
  }

  // sandboxed iframe prevents using PointerLock (e.g. Yahoo)
  // or
  // When browser exits PointerLock by ESC key,
  // it takes 1 seconds before it accepts new request.
  // if user trying to aquire lock during that period, it throws
  // [DOMException: The user has "exited the lock" before this request was completed.]
  // just clean up
  pointerLockError() {
    // the scroller never activated, but clean up just in case.
    this.isActivated = false
    this.onDeactivated()
  }

  matchCombo(combo: Combo) {
    this.checkInitialized()

    return (
      this.config.activation.type === combo.type &&
      this.config.activation.button === combo.button &&
      // every activation mods need to be pressed
      Object.entries(this.config.activation.modifiers)
        .filter(([, pressed]) => pressed)
        .every(([mod]) => combo.modifiers[mod as keyof ModifierFlag]) &&
      // every non-activation mods should NOT be pressed
      Object.entries(this.config.activation.nonActivation)
        .filter(([, pressed]) => pressed)
        .every(([mod]) => !combo.modifiers[mod as keyof ModifierFlag])
    )
  }

  checkTrigger(e: MouseEvent | KeyboardEvent) {
    const combo = parseInput(e)
    if (!combo) return
    const matched = this.matchCombo(combo)
    if (!matched) return

    const target = findTarget(e)
    if (!target) return

    this.scrollTarget = target
    e.preventDefault()
    e.stopPropagation()
    this.activate()
  }

  handleMouseMove(e: MouseEvent) {
    this.checkInitialized()

    if (this.scrollTarget) {
      const dy =
        e.movementY *
        (this.config.naturalScrolling ? -1 : 1) *
        calcMultiplier(this.config.sensitivity)
      this.scrollTarget.scrollBy(0, dy)
    }
  }

  handleClickCancel() {
    this.checkInitialized()

    // preventing immediate cancelation after activation
    if (
      this.config.activation.type === "mouse" &&
      this.preventClickCancelOnce
    ) {
      this.preventClickCancelOnce = false
      return
    }

    if (this.isActivated) {
      this.deactivate()
    }
  }

  handleKeyComboCancel(e: KeyboardEvent) {
    const combo = parseInput(e)
    if (!combo) return
    this.matchCombo(combo) && this.deactivate()
  }
}

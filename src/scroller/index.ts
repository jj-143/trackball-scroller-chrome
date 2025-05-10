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
  deactivationQueued: boolean

  constructor() {
    // state
    this.#isInitialized = false
    this.isEnabled = false
    this.isActivated = false
    this.scrollTarget = null
    this.deactivationQueued = false

    this.checkTrigger = this.checkTrigger.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.queueDeactivation = this.queueDeactivation.bind(this)
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
    if (this.isActivated) {
      this.deactivate()
      // PointerLockChange listener's getting removed
      this.onDeactivated()
    }
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

    // ClickToCancel related
    document.addEventListener("mousedown", this.queueDeactivation)
    document.addEventListener("mouseup", this.processDeactivationQueue)

    document.addEventListener("keydown", this.handleKeyComboCancel)
    document.addEventListener("mousemove", this.handleMouseMove)
  }

  // NOTE: multiple call results to same result as one call
  onDeactivated() {
    allowContextMenu()
    revertSmoothScroll()
    this.isEnabled && this.attachTrigger()

    // ClickToCancel related
    document.removeEventListener("mousedown", this.queueDeactivation)
    document.removeEventListener("mouseup", this.processDeactivationQueue)

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

    if (!this.scrollTarget) return

    // Scroll axis
    const canScrollH = e.shiftKey
    const canScrollV = !canScrollH // H prevents V

    // Calculate amount
    const dx =
      (canScrollH ? 1 : 0) *
      e.movementX *
      (this.config.naturalScrolling ? -1 : 1) *
      calcMultiplier(this.config.sensitivity)

    const dy =
      (canScrollV ? 1 : 0) *
      e.movementY *
      (this.config.naturalScrolling ? -1 : 1) *
      calcMultiplier(this.config.sensitivity)

    // Scroll
    this.scrollTarget.scrollBy(dx, dy)
  }

  handleKeyComboCancel(e: KeyboardEvent) {
    const combo = parseInput(e)
    if (!combo) return
    this.matchCombo(combo) && this.deactivate()
  }

  /**
   * Enabling any mouse click to deactivate Scroll Mode.
   * Actual deactivation is deferred to the mouseup Event.
   * see: {@link Scroller.processDeactivationQueue()}
   */
  queueDeactivation() {
    if (this.isActivated) {
      this.deactivationQueued = true
    }
  }

  /**
   * If we Deactivate instantly, everything works as intended except it doesn't
   * show the mouse pointer until a mouse move or a click (only in Chrome).
   *
   * It only gives false the impression of not deactivated properly and
   * makes me want to move the mouse to ensure it's back to normal mode.
   *
   * This mild annoyance can be fixed if we defer the deactivation;
   * not sure the exact timeing but after the mouseup Event seems sufficient.
   *
   * NOTE:
   * This doesn't happen when `exitPointerLock()` is in click event,
   * but we have to do it in mousedown due to Firefox not firing click event
   * other than button 0 (main button).
   */
  processDeactivationQueue = () => {
    if (!this.deactivationQueued) return
    this.deactivationQueued = false
    this.deactivate()
  }
}

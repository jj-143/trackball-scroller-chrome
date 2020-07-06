import Scroller from "."

document.documentElement.requestPointerLock = jest.fn()
document.exitPointerLock = jest.fn()

const modifiers = {
  ctrl: false,
  alt: false,
  shift: false,
  meta: false,
}

const scrollerConfig: ScrollerConfig = {
  activation: {
    type: "mouse",
    button: 1,
    modifiers: { ...modifiers },
    nonActivation: { ...modifiers },
  },
  naturalScrolling: true,
  sensitivity: 10,
}

let scroller: Scroller

beforeEach(() => {
  scroller = new Scroller()
  scroller.setConfig(scrollerConfig)
})

afterEach(() => {
  scroller.disable()
})

describe("enable / disable", () => {
  it("should be initially disabled", () => {
    expect(scroller.isEnabled).toBe(false)
  })

  test("enable() should set state correctly", () => {
    expect(scroller.isEnabled).toBe(false)
    scroller.enable()
    expect(scroller.isEnabled).toBe(true)
  })

  test("disable() should set state correctly", () => {
    scroller.enable()
    scroller.disable()
    expect(scroller.isEnabled).toBe(false)
  })
})

describe("activation / deactivation", () => {
  it("cannot be activated after disable()", () => {
    scroller.enable()
    scroller.disable()
    scroller.activate()
    expect(scroller.isActivated).toBe(false)
    scroller.disable()
  })

  it("can be activated after enable()", () => {
    scroller.enable()
    scroller.activate()
    expect(scroller.isActivated).toBe(true)
  })

  it("should be deactivated", () => {
    scroller.enable()
    scroller.activate()
    scroller.deactivate()
    expect(scroller.isActivated).toBe(false)
  })

  it("should be deactivated after disable()", () => {
    scroller.enable()
    scroller.activate()
    scroller.disable()
    expect(scroller.isActivated).toBe(false)
  })
})

describe("match mouse combo", () => {
  it("should match combo", () => {
    const scrollerConfig = {
      activation: {
        type: "mouse" as const,
        button: 0,
        modifiers: { ...modifiers },
        nonActivation: { ...modifiers },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }

    let combo: Combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo with modifiers", () => {
    const scrollerConfig = {
      activation: {
        type: "mouse" as const,
        button: 0,
        modifiers: { ...modifiers, ctrl: true },
        nonActivation: { ...modifiers },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }

    let combo: Combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers, ctrl: true },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)

    combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers, ctrl: true, alt: true, shift: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)

    combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers, alt: true },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should not match", () => {
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    let combo: Combo = {
      type: "keyboard" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, alt: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
      nonActivation: { ...modifiers, ctrl: true },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })
})

import * as findTargetM from "./utils/findTarget"
jest.spyOn(findTargetM, "findTarget").mockReturnValue(document.documentElement)

// NEEDS MOCK: manually calling [pointerLockChange] always "deactivates"
// since [document.pointerLockElement] is always undefined in test.
// needs mock pointerLockElement after "activated"
// and needs to remove after "deactivate()" call.
xdescribe("activation by mouse", () => {
  it("should activate by mouse", () => {
    const scrollerConfig = {
      activation: {
        type: "mouse" as const,
        button: 0,
        modifiers: { ...modifiers },
        nonActivation: { ...modifiers },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }

    scroller.setConfig(scrollerConfig)
    scroller.enable()

    const evt = new MouseEvent("mousedown", {
      button: 0,
    })

    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(true)
  })

  it("should deactivate by mouse", () => {
    const scrollerConfig = {
      activation: {
        type: "mouse" as const,
        button: 0,
        modifiers: { ...modifiers },
        nonActivation: { ...modifiers },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }

    scroller.setConfig(scrollerConfig)
    scroller.enable()

    let evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(true)

    evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    // manual call
    scroller.pointerLockChange()
    expect(scroller.isActivated).toBe(false)
  })

  it("should be deactivated after losing PointerLock", () => {
    const scrollerConfig = {
      activation: {
        type: "mouse" as const,
        button: 0,
        modifiers: { ...modifiers },
        nonActivation: { ...modifiers },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    scroller.setConfig(scrollerConfig)
    scroller.enable()

    let evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)

    // mocking ESC or Tab switch or etc.
    // In test, requestPointerLock is NOOP, so it's null
    // document.pointerLockElement === null
    evt = new MouseEvent("mousemove", {
      button: 0,
    })
    document.dispatchEvent(evt)
    // manual call
    scroller.pointerLockChange()
    expect(scroller.isActivated).toBe(false)
  })
})

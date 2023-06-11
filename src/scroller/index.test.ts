import waitForExpect from "wait-for-expect"
import Scroller from "."

document.documentElement.requestPointerLock = jest.fn(async () => {
  // @ts-ignore
  document.pointerLockElement = document.documentElement
  document.dispatchEvent(new Event("pointerlockchange"))
})

document.exitPointerLock = jest.fn(() => {
  // @ts-ignore
  document.pointerLockElement = undefined
  document.dispatchEvent(new Event("pointerlockchange"))
})

document.exitPointerLock = jest.fn()

const scrollerConfig: ScrollerConfig = {
  activation: {
    type: "mouse",
    button: 1,
    modifiers: {},
    nonActivation: {},
  },
  naturalScrolling: true,
  sensitivity: 10,
}

let scroller: Scroller

beforeEach(() => {
  scroller = new Scroller()
  scroller.init(scrollerConfig)
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

describe("click to cancel - Chrome", () => {
  it("should deactivate after a click, when it activated BEFORE the click event", async () => {
    scroller.enable()
    const onActivated = jest.spyOn(scroller, "onActivated")

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))

    await waitForExpect(() => {
      expect(onActivated).toHaveBeenCalledTimes(1)
    })

    document.dispatchEvent(new MouseEvent("click", { button: 1 }))

    // - should be activated

    expect(document.pointerLockElement).toBeDefined()
    expect(scroller.isActivated).toBe(true)

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))
    document.dispatchEvent(new MouseEvent("click", { button: 1 }))

    // - should be deactivated

    expect(scroller.isActivated).toBe(false)
  })

  it("should deactivate after a click, when it activated AFTER the click event", async () => {
    scroller.enable()
    const onActivated = jest.spyOn(scroller, "onActivated")

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))
    document.dispatchEvent(new MouseEvent("click", { button: 1 }))

    await waitForExpect(() => {
      expect(onActivated).toHaveBeenCalledTimes(1)
    })

    // - should be activated

    expect(document.pointerLockElement).toBeDefined()
    expect(scroller.isActivated).toBe(true)

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))
    document.dispatchEvent(new MouseEvent("click", { button: 1 }))

    // - should be deactivated

    expect(scroller.isActivated).toBe(false)
  })
})

describe("click to cancel - Firefox", () => {
  it("should deactivate after a click with activation button", async () => {
    scroller.enable()
    const onActivated = jest.spyOn(scroller, "onActivated")

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))

    await waitForExpect(() => {
      expect(onActivated).toHaveBeenCalledTimes(1)
    })

    // - should be activated

    expect(document.pointerLockElement).toBeDefined()
    expect(scroller.isActivated).toBe(true)

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))

    // - should be deactivated

    expect(scroller.isActivated).toBe(false)
  })

  it("should deactivate after a click with different button", async () => {
    scroller.enable()
    const onActivated = jest.spyOn(scroller, "onActivated")

    document.dispatchEvent(new MouseEvent("mousedown", { button: 1 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 1 }))

    await waitForExpect(() => {
      expect(onActivated).toHaveBeenCalledTimes(1)
    })

    // - should be activated

    expect(document.pointerLockElement).toBeDefined()
    expect(scroller.isActivated).toBe(true)

    document.dispatchEvent(new MouseEvent("mousedown", { button: 2 }))
    document.dispatchEvent(new MouseEvent("mouseup", { button: 2 }))

    // - should be deactivated

    expect(scroller.isActivated).toBe(false)
  })
})

describe("matching Combo", () => {
  it("should match combo", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 0,
        modifiers: {},
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }

    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: {},
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo with modifiers", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 0,
        modifiers: { ctrl: true },
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: { ctrl: true },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo with extra modifiers", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 0,
        modifiers: { ctrl: true },
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: { ctrl: true, alt: true, shift: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo without nonActivation modifier presents", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 0,
        modifiers: { ctrl: true },
        nonActivation: { alt: true },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: { ctrl: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should NOT match with wrong type", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: { ctrl: true },
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "keyboard",
      button: "e",
      modifiers: { ctrl: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })

  it("should NOT match with wrong mouse button", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: {},
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: {},
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })

  it("should NOT match with wrong mouse button with same modifiers", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: { ctrl: true },
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 0,
      modifiers: { ctrl: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })

  it("should NOT match with different modifiers", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: { alt: true },
        nonActivation: {},
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 1,
      modifiers: { ctrl: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })

  it("should NOT match when Combo contains nonActivation modifier", () => {
    const scrollerConfig: ScrollerConfig = {
      activation: {
        type: "mouse",
        button: 1,
        modifiers: { ctrl: true },
        nonActivation: { ctrl: true },
      },
      sensitivity: 10,
      naturalScrolling: false,
    }
    const combo: Combo = {
      type: "mouse",
      button: 1,
      modifiers: { ctrl: true },
    }

    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(false)
  })
})

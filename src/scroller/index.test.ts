import Scroller from "."

document.documentElement.requestPointerLock = jest.fn()
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

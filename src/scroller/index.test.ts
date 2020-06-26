import Scroller from "."

document.documentElement.requestPointerLock = jest.fn()
document.exitPointerLock = jest.fn()

const modifiers = {
  ctrl: false,
  alt: false,
  shift: false,
  meta: false,
}

describe("enable / disable", () => {
  it("should be initially disabled", () => {
    scroller = new Scroller()
    expect(scroller.isEnabled).toBe(false)
  })

  test("enable() should set state correctly", () => {
    scroller = new Scroller()
    expect(scroller.isEnabled).toBe(false)
    scroller.enable()
    expect(scroller.isEnabled).toBe(true)
  })

  test("disable() should set state correctly", () => {
    scroller = new Scroller()
    scroller.enable()
    scroller.disable()
    expect(scroller.isEnabled).toBe(false)
  })
})

let scroller: Scroller

afterEach(() => {
  scroller.disable()
})

describe("activation / deactivation", () => {
  it("cannot be activated after disable()", () => {
    scroller = new Scroller()
    scroller.enable()
    scroller.disable()
    scroller.activate()
    expect(scroller.isActivated).toBe(false)
    scroller.disable()
  })

  it("can be activated after enable()", () => {
    scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    expect(scroller.isActivated).toBe(true)
  })

  it("should be deactivated", () => {
    scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    scroller.deactivate()
    expect(scroller.isActivated).toBe(false)
  })

  it("should be deactivated after disable()", () => {
    scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    scroller.disable()
    expect(scroller.isActivated).toBe(false)
  })
})

describe("match mouse combo", () => {
  it("should match combo", () => {
    scroller = new Scroller()
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    let combo: Combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
    }
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo with modifiers", () => {
    scroller = new Scroller()
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    let combo: Combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers, ctrl: true },
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
    scroller = new Scroller()
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

//here
describe("activation by mouse", () => {
  it("should activate by mouse", () => {
    scroller = new Scroller()
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    scroller.enable()

    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)
    const evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(true)
  })

  it("should deactivate by mouse", () => {
    scroller = new Scroller()
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    scroller.enable()
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)

    let evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(true)

    evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(false)
  })

  it("should be deactivated after losing PointerLock", () => {
    scroller = new Scroller()
    const scrollerConfig = {
      activation: null,
      sensitivity: 10,
      naturalScrolling: false,
    }

    scroller.enable()
    scrollerConfig.activation = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
      nonActivation: { ...modifiers },
    }
    scroller.setConfig(scrollerConfig)

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

    expect(scroller.isActivated).toBe(false)
  })
})

xdescribe("scroll", () => {
  // TODO: dom simulation needed for test
  it("should scroll", () => {
    scroller = new Scroller()
    scroller.enable()
    // setTarget
    scroller.activate()

    const evt = new MouseEvent("mousemove", {
      // set amount?
    })
    scroller.handleMouseMove(evt)
    // how to check?
  })
})

xdescribe("testing testScroll", () => {
  it("should scroll", () => {
    // TODO: [DOMElement.scrollBy()] is not defined.
    // need some scrollable content here.
    const target = document.createElement("div")
    const original = target.scrollTop
    console.log(original)

    target.scrollBy(0, 100)
    const changed = target.scrollTop
    console.log(changed)
  })
})

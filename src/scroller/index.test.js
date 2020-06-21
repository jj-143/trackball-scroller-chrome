import Scroller from "."

// TODO:
// add mock function requestPointerLock(), exitPointerLock()
// jsdom seems don't have these.

describe("enable / disable", () => {
  it("should be initially disabled", () => {
    const scroller = new Scroller()
    expect(scroller.isEnabled).toBe(false)
  })

  test("enable() should set state correctly", () => {
    const scroller = new Scroller()
    expect(scroller.isEnabled).toBe(false)
    scroller.enable()
    expect(scroller.isEnabled).toBe(true)
  })

  test("disable() should set state correctly", () => {
    const scroller = new Scroller()
    scroller.enable()
    scroller.disable()
    expect(scroller.isEnabled).toBe(false)
  })
})

describe("activation / deactivation", () => {
  it("cannot be activated after disable()", () => {
    const scroller = new Scroller()
    scroller.enable()
    scroller.disable()
    scroller.activate()
    expect(scroller.isActivated).toBe(false)
  })

  it("can be activated after enable()", () => {
    const scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    expect(scroller.isActivated).toBe(true)
  })

  it("should be deactivated", () => {
    const scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    scroller.deactivate()
    expect(scroller.isActivated).toBe(false)
  })

  it("should be deactivated after disable()", () => {
    const scroller = new Scroller()
    scroller.enable()
    scroller.activate()
    scroller.disable()
    expect(scroller.isActivated).toBe(false)
  })
})

describe("match mouse combo", () => {
  it("should match combo", () => {
    const scroller = new Scroller()
    let combo = {
      type: "mouse",
      button: 0,
      mods: new Set(),
    }
    let activation = {
      type: "mouse",
      button: 0,
      mods: new Set(),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should match combo with mods", () => {
    const scroller = new Scroller()
    let combo = {
      type: "mouse",
      button: 0,
      mods: new Set(["ctrl"]),
    }
    let activation = {
      type: "mouse",
      button: 0,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(true)

    combo = {
      type: "mouse",
      button: 0,
      mods: new Set(["ctrl", "alt", "shift"]),
    }
    activation = {
      type: "mouse",
      button: 0,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(true)

    combo = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
    }
    activation = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(["alt"]),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(true)
  })

  it("should not match", () => {
    const scroller = new Scroller()
    let combo = {
      type: "keyboard",
      button: 1,
      mods: new Set(["ctrl"]),
    }
    let activation = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse",
      button: 1,
      mods: new Set(),
    }
    activation = {
      type: "mouse",
      button: 0,
      mods: new Set(),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
    }
    activation = {
      type: "mouse",
      button: 0,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse",
      button: 1,
      mods: new Set(["alt"]),
    }
    activation = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(false)

    combo = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
    }
    activation = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
      nonActivation: new Set(["ctrl"]),
    }
    scroller.activation = activation
    expect(scroller.matchCombo(combo)).toBe(false)
  })
})

describe("activation by mouse", () => {
  it("should activate by mouse", () => {
    const scroller = new Scroller()
    scroller.enable()

    const activation = {
      type: "mouse",
      button: 0,
      mods: new Set(),
      nonActivation: new Set(),
    }
    scroller.activation = activation
    const evt = new MouseEvent("mousedown", {
      button: 0,
    })
    document.dispatchEvent(evt)
    expect(scroller.isActivated).toBe(true)
  })

  it("should deactivate by mouse", () => {
    const scroller = new Scroller()
    scroller.enable()
    let activation = {
      type: "mouse",
      button: 0,
      mods: new Set(),
      nonActivation: new Set(),
    }
    scroller.activation = activation

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
})

describe("scroll", () => {
  // TODO: jsdom doesn't seem to support PointerLock
  // dom simulation needed for test even if it does.
  xit("should scroll", () => {
    const scroller = new Scroller()
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

describe("testing testScroll", () => {
  xit("should scroll", () => {
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

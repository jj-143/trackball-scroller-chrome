import { parseInput } from "./parseInput"

const modifiers = {
  ctrl: false,
  alt: false,
  shift: false,
  meta: false,
}

describe("parse MouseDown event", () => {
  it("should parse mouse input", () => {
    let expected: Combo = {
      type: "mouse" as const,
      button: 0,
      modifiers: { ...modifiers },
    }
    let evt = new MouseEvent("mousedown", {
      button: 0,
    })

    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers },
    }
    evt = new MouseEvent("mousedown", {
      button: 1,
    })
    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse" as const,
      button: 2,
      modifiers: { ...modifiers },
    }
    evt = new MouseEvent("mousedown", {
      button: 2,
    })
    expect(parseInput(evt)).toEqual(expected)
  })

  it("should parse mouse input with modifiers", () => {
    let expected = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true },
    }
    let evt = new MouseEvent("mousedown", {
      button: 1,
      ctrlKey: true,
    })

    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers, ctrl: true, alt: true },
    }
    evt = new MouseEvent("mousedown", {
      button: 1,
      ctrlKey: true,
      altKey: true,
    })
    expect(parseInput(evt)).toEqual(expected)
  })
})

describe("parse keydown event", () => {
  it("should parse keyboard input", () => {
    let expected: Combo = {
      type: "keyboard" as const,
      button: "z",
      modifiers: { ...modifiers },
    }
    let evt = new KeyboardEvent("keydown", {
      key: "z",
    })

    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "keyboard" as const,
      button: "F1",
      modifiers: { ...modifiers },
    }

    evt = new KeyboardEvent("keydown", {
      key: "F1",
    })
    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "keyboard" as const,
      button: "1",
      modifiers: { ...modifiers },
    }
    evt = new KeyboardEvent("keydown", {
      key: "1",
    })
    expect(parseInput(evt)).toEqual(expected)
  })

  it("should parse keyboard input with modifiers", () => {
    let expected = {
      type: "keyboard" as const,
      button: "z",
      modifiers: { ...modifiers, ctrl: true },
    }
    let evt = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
    })

    expect(parseInput(evt)).toEqual(expected)

    expected = {
      type: "keyboard" as const,
      button: "z",
      modifiers: { ...modifiers, ctrl: true, alt: true },
    }
    evt = new KeyboardEvent("keydown", {
      key: "z",
      ctrlKey: true,
      altKey: true,
    })
    expect(parseInput(evt)).toEqual(expected)
  })
})

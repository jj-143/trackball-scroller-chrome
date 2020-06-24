import { parseMouseInput } from "./parseInput"

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

    expect(parseMouseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse" as const,
      button: 1,
      modifiers: { ...modifiers },
    }
    evt = new MouseEvent("mousedown", {
      button: 1,
    })
    expect(parseMouseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse" as const,
      button: 2,
      modifiers: { ...modifiers },
    }
    evt = new MouseEvent("mousedown", {
      button: 2,
    })
    expect(parseMouseInput(evt)).toEqual(expected)
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

    expect(parseMouseInput(evt)).toEqual(expected)

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
    expect(parseMouseInput(evt)).toEqual(expected)
  })
})

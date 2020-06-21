import { parseMouseInput } from "./parseInput"

describe("parse MouseDown event", () => {
  it("should parse mouse input", () => {
    let expected = {
      type: "mouse",
      button: 0,
      mods: new Set(),
    }
    let evt = new MouseEvent("mousedown", {
      button: 0,
    })

    expect(parseMouseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse",
      button: 1,
      mods: new Set(),
    }
    evt = new MouseEvent("mousedown", {
      button: 1,
    })
    expect(parseMouseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse",
      button: 2,
      mods: new Set(),
    }
    evt = new MouseEvent("mousedown", {
      button: 2,
    })
    expect(parseMouseInput(evt)).toEqual(expected)
  })

  it("should parse mouse input with modifiers", () => {
    let expected = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl"]),
    }
    let evt = new MouseEvent("mousedown", {
      button: 1,
      ctrlKey: true,
    })

    expect(parseMouseInput(evt)).toEqual(expected)

    expected = {
      type: "mouse",
      button: 1,
      mods: new Set(["ctrl", "alt"]),
    }
    evt = new MouseEvent("mousedown", {
      button: 1,
      ctrlKey: true,
      altKey: true,
    })
    expect(parseMouseInput(evt)).toEqual(expected)
  })
})

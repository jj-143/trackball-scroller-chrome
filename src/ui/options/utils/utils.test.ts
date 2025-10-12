import { formatCombo } from "./utils"

describe("Format Combo", () => {
  it("should format mouse combo", () => {
    let expected = "Mouse 2"
    let combo: Combo = {
      type: "mouse" as const,
      button: 1,
      modifiers: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatCombo(combo)).toBe(expected)

    expected = "Ctrl + Shift + Meta + Mouse 3"
    combo = {
      type: "mouse" as const,
      button: 2,

      // different order + optional modifier
      modifiers: {
        meta: true,
        ctrl: true,
        shift: true,
      },
    }
    expect(formatCombo(combo)).toBe(expected)
  })

  it("should format key combo", () => {
    let expected = "F3"
    let combo: Combo = {
      type: "keyboard" as const,
      button: "F3",
      modifiers: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatCombo(combo)).toBe(expected)

    expected = "Alt + Meta + Z"
    combo = {
      type: "keyboard" as const,
      button: "z",

      // different order + optional modifier
      modifiers: {
        meta: true,
        alt: true,
      },
    }
    expect(formatCombo(combo)).toBe(expected)
  })
})

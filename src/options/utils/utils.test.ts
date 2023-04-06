import { formatActivation } from "./utils"

describe("Format Activation", () => {
  it("should format mouse activation", () => {
    let expected = "Mouse 2"
    let activation: Activation = {
      type: "mouse" as const,
      button: 1,
      modifiers: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
      nonActivation: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatActivation(activation)).toBe(expected)

    expected = "Ctrl + Shift + Meta + Mouse 3"
    activation = {
      type: "mouse" as const,
      button: 2,

      // different order + optional modifier
      modifiers: {
        meta: true,
        ctrl: true,
        shift: true,
      },
      nonActivation: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatActivation(activation)).toBe(expected)
  })

  it("should format key activation", () => {
    let expected = "F3"
    let activation: Activation = {
      type: "keyboard" as const,
      button: "F3",
      modifiers: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
      nonActivation: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatActivation(activation)).toBe(expected)

    expected = "Alt + Meta + Z"
    activation = {
      type: "keyboard" as const,
      button: "z",

      // different order + optional modifier
      modifiers: {
        meta: true,
        alt: true,
      },
      nonActivation: {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      },
    }
    expect(formatActivation(activation)).toBe(expected)
  })
})

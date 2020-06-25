import { formatActivation } from "./utils"

describe("Format Activation", () => {
  it("should format mouse activation", () => {
    let expected = "Mouse 2"
    let activation = {
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

    expected = "Ctrl + Alt + Shift + Meta + Mouse 3"
    activation = {
      type: "mouse" as const,
      button: 2,
      modifiers: {
        ctrl: true,
        alt: true,
        shift: true,
        meta: true,
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
    let activation = {
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

    expected = "Ctrl + Alt + Shift + Meta + Z"
    activation = {
      type: "keyboard" as const,
      button: "z",
      modifiers: {
        ctrl: true,
        alt: true,
        shift: true,
        meta: true,
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

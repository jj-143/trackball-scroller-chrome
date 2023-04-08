import { convertFrom_0_0_3_To_1_0_0, Store_0_0_3 } from "./migration"

describe("convert 0.0.3 store to 1.0.0 store", () => {
  it("should convert mouse activation", () => {
    const oldSetting: Store_0_0_3 = {
      enabled: true,
      setting: {
        naturalScrolling: {
          value: true,
        },
        sensitivityStep: 15,
        activation: {
          input: {
            type: "mouse",
            key: 2,
          },
          modifiers: ["Control", "Alt"],
        },
        nonActivation: ["Meta", "Shift"],
      },
    }

    const expected: UserSettings = {
      enabled: true,
      userOption: {
        scroller: {
          activation: {
            type: "mouse",
            button: 2,
            modifiers: {
              ctrl: true,
              alt: true,
              shift: false,
              meta: false,
            },
            nonActivation: {
              ctrl: false,
              alt: false,
              shift: true,
              meta: true,
            },
          },
          naturalScrolling: true,
          sensitivity: 15,
        },
      },
    }

    expect(convertFrom_0_0_3_To_1_0_0(oldSetting)).toEqual(expected)
  })

  it("should convert keyboard activation", () => {
    const oldSetting: Store_0_0_3 = {
      enabled: true,
      setting: {
        naturalScrolling: {
          value: true,
        },
        sensitivityStep: 15,
        activation: {
          input: {
            type: "keydown",
            key: "z",
          },
          modifiers: [],
        },
        nonActivation: ["Meta", "Shift"],
      },
    }

    const expected: UserSettings = {
      enabled: true,
      userOption: {
        scroller: {
          activation: {
            type: "keyboard",
            button: "z",
            modifiers: {
              ctrl: false,
              alt: false,
              shift: false,
              meta: false,
            },
            nonActivation: {
              ctrl: false,
              alt: false,
              shift: true,
              meta: true,
            },
          },
          naturalScrolling: true,
          sensitivity: 15,
        },
      },
    }

    expect(convertFrom_0_0_3_To_1_0_0(oldSetting)).toEqual(expected)
  })
})

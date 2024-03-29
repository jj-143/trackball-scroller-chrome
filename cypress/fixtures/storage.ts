type ModsArgs =
  UserSettings["userOption"]["scroller"]["activation"]["modifiers"]

export function createStorageData<T extends "mouse" | "keyboard">(option: {
  type: T
  button: T extends "mouse" ? number : string
  modsActivation?: ModsArgs
  modsNonActivation?: ModsArgs
  sensitivity?: number
  naturalScrolling?: boolean
}): UserSettings {
  return {
    enabled: true,
    userOption: {
      scroller: {
        activation: {
          type: option.type,
          button: option.button,
          modifiers: {
            ctrl: false,
            alt: false,
            shift: false,
            meta: false,
            ...option.modsActivation,
          },
          nonActivation: {
            ctrl: false,
            alt: false,
            shift: false,
            meta: false,
            ...option.modsNonActivation,
          },
        },
        sensitivity: option.sensitivity ?? 10,
        naturalScrolling: option.naturalScrolling ?? true,
      },
    },
  }
}

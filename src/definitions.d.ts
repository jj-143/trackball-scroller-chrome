interface Option {
  key: string
  value: object
}

interface Combo {
  type: "mouse" | "keyboard"
  button: number | string
  modifiers: ModifierFlag
}

interface ModifierFlag {
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

interface Activation {
  type: "mouse" | "keyboard"
  button: number | string
  modifiers: ModifierFlag
  nonActivation: ModifierFlag
}

interface ScrollerOption {
  activation: Activation
  sensitivity: number
  naturalScrolling: boolean
}

interface UserOption {
  scroller: ScrollerOption
}

interface UserSettings {
  enabled: boolean
  userOption: UserOption
}

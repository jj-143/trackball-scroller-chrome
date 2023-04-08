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

interface ScrollerConfig {
  activation: Activation
  sensitivity: number
  naturalScrolling: boolean
}

interface UserOption {
  scroller: ScrollerConfig
}

interface UserSettings {
  enabled: boolean
  userOption: UserOption
}

interface StoreResponse {
  enabled: boolean
  scrollerConfig: ScrollerConfig
}

type ScrollTarget = HTMLElement | Window

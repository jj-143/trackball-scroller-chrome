interface Store_0_0_3 {
  enabled: boolean
  setting: Settings_0_0_3
}

interface Settings_0_0_3 {
  naturalScrolling: {
    value: boolean
  }
  sensitivityStep: number
  activation: {
    input: {
      type: "mouse" | "keydown"
      key: number | string
    }
    modifiers: string[]
  }
  nonActivation: string[]
}

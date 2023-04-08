import { Store } from "."

export type Store_0_0_3 = {
  enabled: boolean
  setting: Settings_0_0_3
}

export interface Settings_0_0_3 {
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

export function convertFrom_0_0_3_To_1_0_0(store: Store_0_0_3): UserSettings {
  const { setting, enabled } = store
  const MODIFIERS = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  }
  const MODIFIER_MAP = {
    Control: "ctrl" as const,
    Alt: "alt" as const,
    Shift: "shift" as const,
    Meta: "meta" as const,
  }

  const naturalScrolling = setting.naturalScrolling.value
  const sensitivity = setting.sensitivityStep
  const activation = setting.activation
  const newModifiers = { ...MODIFIERS }
  const newNonActivation = { ...MODIFIERS }
  const oldModifier = setting.activation.modifiers.map(
    (mod) => MODIFIER_MAP[mod as keyof typeof MODIFIER_MAP]
  )
  const oldNonActivation = setting.nonActivation.map(
    (mod) => MODIFIER_MAP[mod as keyof typeof MODIFIER_MAP]
  )

  oldModifier.forEach((mod) => {
    newModifiers[mod] = true
  })
  oldNonActivation.forEach((mod) => {
    newNonActivation[mod] = true
  })

  const newActivation: Activation = {
    type: activation.input.type === "mouse" ? "mouse" : "keyboard",
    button: activation.input.key,
    modifiers: newModifiers,
    nonActivation: newNonActivation,
  }
  const newScrollerConfig: ScrollerConfig = {
    activation: newActivation,
    sensitivity: sensitivity,
    naturalScrolling: naturalScrolling,
  }
  const newUserSettings: UserSettings = {
    enabled,
    userOption: {
      scroller: newScrollerConfig,
    },
  }
  return newUserSettings
}

export function loadStore_0_0_3(): Promise<Store_0_0_3> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(
        ["setting", "enabled"],
        ({ setting, enabled }) => {
          resolve({
            setting,
            enabled,
          })
        }
      )
    } catch (e) {
      reject(e)
    }
  })
}

function removeStore_0_0_3() {
  chrome.storage.sync.remove(["Domainsetting", "enabled"])
}

export async function migrateStoreFrom_0_0_3(store: Store) {
  const oldStore = await loadStore_0_0_3()
  const newStore = convertFrom_0_0_3_To_1_0_0(oldStore)
  await store.updateStore(newStore)
  removeStore_0_0_3()
}

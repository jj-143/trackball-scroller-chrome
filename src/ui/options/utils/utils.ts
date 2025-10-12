import Scroller from "@/scroller"
import type { Store } from "@/store"

export function isOnlyMouse3(activation: Activation) {
  // added: no warning after checking non-activation
  return (
    Object.values(activation.modifiers).filter((_) => _).length === 0 &&
    activation.type === "mouse" &&
    activation.button === 2 &&
    Object.values(activation.nonActivation).filter((_) => _).length === 0
  )
}

export type Payload = {
  COMBO: Combo
  NON_ACTIVATION: ModifierFlag
  SCROLLER_OPTION: Partial<Omit<ScrollerConfig, "activation" | "sensitivity">>
  SENSITIVITY: number
}

export async function updateSettings<T extends keyof Payload>(
  store: Store,
  type: T,
  payload: Payload[T]
) {
  const oldSettings = await store.getStore()
  const newSettings = updateSettingsReducer(oldSettings, type, payload)
  store.updateStore(newSettings)
}

function updateSettingsReducer<T extends keyof Payload>(
  oldSettings: UserSettings,
  type: T,
  payload: Payload[T]
): UserSettings {
  // we can do this since [UserSettings] is JSON-ifiable
  const newSettings: UserSettings = JSON.parse(JSON.stringify(oldSettings))

  switch (type) {
    case "COMBO":
      newSettings.userOption.scroller.activation = {
        ...newSettings.userOption.scroller.activation,
        ...(payload as Payload["COMBO"]),
      }
      break
    case "NON_ACTIVATION":
      newSettings.userOption.scroller.activation.nonActivation = {
        ...newSettings.userOption.scroller.activation.nonActivation,
        ...(payload as Payload["NON_ACTIVATION"]),
      }
      break
    case "SCROLLER_OPTION":
      newSettings.userOption.scroller = {
        ...newSettings.userOption.scroller,
        ...(payload as Payload["SCROLLER_OPTION"]),
      }
      break
    case "SENSITIVITY":
      {
        const newSensitivity =
          newSettings.userOption.scroller.sensitivity +
          (payload as Payload["SENSITIVITY"])
        if (newSensitivity < 1 || newSensitivity > 20) break
        newSettings.userOption.scroller.sensitivity = newSensitivity
      }
      break
  }
  return newSettings
}

export function shimPreventActivation(scroller: Scroller, className: string) {
  scroller.checkTrigger = function (event: MouseEvent) {
    const elm = event.target as Element
    const originalFn = Scroller.prototype.checkTrigger.bind(scroller)
    if (!elm.classList.contains(className)) {
      return originalFn(event)
    }
  }
}

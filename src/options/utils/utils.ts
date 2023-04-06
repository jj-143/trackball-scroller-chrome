const MODIFIERS_ORDER = {
  Ctrl: 0,
  Alt: 1,
  Shift: 2,
  Meta: 3,
}

export function formatActivation(activation: Activation): string {
  const button =
    activation.type === "mouse"
      ? `Mouse ${(activation.button as number) + 1}`
      : `${activation.button.toString().toUpperCase()}`
  const modifiers = Object.entries(activation.modifiers)
    .filter(([_, value]) => value)
    .map(([key, _]) => key[0].toUpperCase() + key.substr(1))

  modifiers.sort(
    (a: string, b: string) => MODIFIERS_ORDER[a] - MODIFIERS_ORDER[b]
  )

  return modifiers.concat(button).join(" + ")
}

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
  ACTIVATION: Combo
  NON_ACTIVATION: ModifierFlag
  SCROLLER_OPTION: Partial<Omit<ScrollerConfig, "activation" | "sensitivity">>
  SENSITIVITY: number
}

export function updateSettingsReducer<T extends keyof Payload>(
  oldSettings: UserSettings,
  type: T,
  payload: Payload[T]
): UserSettings {
  // we can do this since [UserSettings] is JSON-ifiable
  const newSettings: UserSettings = JSON.parse(JSON.stringify(oldSettings))

  switch (type) {
    case "ACTIVATION":
      newSettings.userOption.scroller.activation = {
        ...newSettings.userOption.scroller.activation,
        ...(payload as Payload["ACTIVATION"]),
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

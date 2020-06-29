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

export function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "GET_USER_SETTINGS",
      },
      (settings: UserSettings) => {
        resolve(settings)
      }
    )
  })
}

export function saveSettings(settings: UserSettings) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "SAVE_USER_SETTINGS", settings },
      (err) => {
        if (!err) {
          resolve()
        } else {
          reject()
        }
      }
    )
  })
}

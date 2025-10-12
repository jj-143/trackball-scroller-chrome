import { useState } from "preact/hooks"
import { clsx } from "clsx"

import CustomizeCombo, { equalsCombo, formatCombo } from "../utils/combo"
import api, { CLS_PREVENT_ACTIVATION } from "@/ui/api"
import { isOnlyMouse3 } from "../utils/utils"

import { Option } from "../layouts"
import L from "../layout.module.scss"
import S from "./ActivationCombo.module.scss"

type Props = {
  activation: Activation
}

export default function ActivationCombo(props: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const showMouse3Warning = isOnlyMouse3(props.activation)

  function startCustomizeCombo() {
    setIsEditing(true)
    new CustomizeCombo()
      .start()
      .then((combo) => {
        if (!equalsCombo(props.activation, combo)) {
          api.updateSettings("COMBO", combo)
        }
      })
      .finally(() => setIsEditing(false))
  }

  return (
    <Option
      className={clsx(S.activation, showMouse3Warning && S.showMouse3Warning)}
    >
      <label class={L.label}>activation</label>

      <button
        class={clsx(
          S.editCombo,
          isEditing && S.editing,
          CLS_PREVENT_ACTIVATION
        )}
        disabled={isEditing}
        onClick={startCustomizeCombo}
        data-cy="activation"
      >
        {isEditing ? "hit combo" : formatCombo(props.activation)}
      </button>

      {showMouse3Warning && (
        <div class={S.mouse3Warning} data-cy="warning-mouse3">
          To use context menu, make sure to tick any modifier keys below.
        </div>
      )}
    </Option>
  )
}

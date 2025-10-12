import { useState } from "preact/hooks"
import CustomizeCombo, { equalsCombo, formatCombo } from "../utils/combo"

type Props = {
  combo: Combo
  onChange: (combo: Combo) => void
}

export default function ActivationCombo(props: Props) {
  const [isEditing, setIsEditing] = useState(false)

  function startCustomizeCombo() {
    setIsEditing(true)
    new CustomizeCombo()
      .start()
      .then((combo) => equalsCombo(props.combo, combo) || props.onChange(combo))
      .finally(() => setIsEditing(false))
  }

  return (
    <button
      className={`activation ${isEditing ? "editing" : ""}`}
      disabled={isEditing}
      onClick={startCustomizeCombo}
      data-cy="activation"
    >
      {isEditing ? "hit combo" : formatCombo(props.combo)}
    </button>
  )
}

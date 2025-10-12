import api from "@/ui/api"

import { Option } from "../layouts"
import L from "../layout.module.scss"
import S from "./Sensitivity.module.scss"

type Props = {
  sensitivity: ScrollerConfig["sensitivity"]
}

function changeSensitivity(value: number) {
  api.updateSettings("SENSITIVITY", value)
}

export default function Sensitivity(props: Props) {
  return (
    <Option>
      <label class={L.label}>sensitivity (1 - 20)</label>
      <div class={S.control}>
        <button
          class={S.pushButton}
          onClick={() => changeSensitivity(-1)}
          data-cy="sensitivity-decrease"
        >
          -
        </button>
        <span class={S.value} data-cy="sensitivity-value">
          {props.sensitivity}
        </span>
        <button
          class={S.pushButton}
          onClick={() => changeSensitivity(1)}
          data-cy="sensitivity-increase"
        >
          +
        </button>
      </div>
    </Option>
  )
}

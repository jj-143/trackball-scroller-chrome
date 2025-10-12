import api from "@/ui/api"

import { Option } from "../layouts"
import L from "../layout.module.scss"
import S from "./NonActivation.module.scss"

type Props = {
  nonActivation: Activation["nonActivation"]
}

function onClickModifier(event: Event) {
  const chip = event.target as HTMLInputElement
  api.updateSettings("NON_ACTIVATION", {
    [chip.name]: chip.checked,
  })
}

export default function NonActivation(props: Props) {
  return (
    <Option>
      <label class={L.label}>don't activate if pressed.. (any)</label>

      <div class={S.modifiers}>
        <span class={S.modifier}>
          <input
            type="checkbox"
            name="ctrl"
            id="non-activate-ctrl"
            checked={props.nonActivation.ctrl}
            onChange={onClickModifier}
            hidden
          />
          <label for="non-activate-ctrl" data-cy="mod-ctrl">
            ctrl
          </label>
        </span>

        <span class={S.modifier}>
          <input
            type="checkbox"
            name="alt"
            id="non-activate-alt"
            checked={props.nonActivation.alt}
            onChange={onClickModifier}
            hidden
          />
          <label for="non-activate-alt" data-cy="mod-alt">
            alt
          </label>
        </span>

        <span class={S.modifier}>
          <input
            type="checkbox"
            name="shift"
            id="non-activate-shift"
            checked={props.nonActivation.shift}
            onChange={onClickModifier}
            hidden
          />
          <label for="non-activate-shift" data-cy="mod-shift">
            shift
          </label>
        </span>

        <span class={S.modifier}>
          <input
            type="checkbox"
            name="meta"
            id="non-activate-meta"
            checked={props.nonActivation.meta}
            onChange={onClickModifier}
            hidden
          />
          <label for="non-activate-meta" data-cy="mod-meta">
            meta
          </label>
        </span>
      </div>
    </Option>
  )
}

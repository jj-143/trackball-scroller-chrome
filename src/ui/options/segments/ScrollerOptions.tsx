import api from "@/ui/api"

import { Option } from "../layouts"
import S from "./ScrollerOptions.module.scss"

type Props = {
  scroller: ScrollerConfig
}

function onClickOption(event: Event) {
  const checkbox = event.currentTarget as HTMLInputElement
  api.updateSettings!("SCROLLER_OPTION", {
    [checkbox.name]: checkbox.checked,
  })
}

export default function ScrollerOpions(props: Props) {
  return (
    <Option>
      <div class={S.optionItem}>
        <label class={S.optionItemRoot} for="natural-scrolling">
          natural scrolling
          <input
            type="checkbox"
            name="naturalScrolling"
            id="natural-scrolling"
            checked={props.scroller.naturalScrolling}
            hidden
            onChange={onClickOption}
          />
          <span class={S.checkbox} data-cy="natural-scrolling" />
        </label>
      </div>
    </Option>
  )
}

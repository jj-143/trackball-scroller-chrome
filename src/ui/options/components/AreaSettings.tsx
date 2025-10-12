import { context } from "../utils/page"
import { isOnlyMouse3 } from "../utils/utils"

type Props = {
  userOption: UserOption
}

function onButtonClick(event: Event) {
  const checkbox = event.currentTarget as HTMLInputElement
  context.updateOption!("SCROLLER_OPTION", {
    [checkbox.name]: checkbox.checked,
  })
}

function onNonActivationChange(event: Event) {
  const chip = event.target as HTMLInputElement
  context.updateOption!("NON_ACTIVATION", {
    [chip.name]: chip.checked,
  })
}

function changeSensitivity(value: number) {
  context.updateOption!("SENSITIVITY", value)
}

export default function AreaSettings(props: Props) {
  const showMouse3Warning = isOnlyMouse3(props.userOption.scroller.activation)

  return (
    <div id="settings">
      <div
        class={showMouse3Warning ? "option warning-mouse3" : "option"}
        id="activation"
        style="position: relative"
      >
        <label class="control">activation</label>
        <div style="display: flex; align-items: center">
          <button class="activation" data-cy="activation">
            Mouse 1
          </button>
        </div>
        <span
          id="warning-mouse3"
          class="hidden"
          style="position: absolute"
          data-cy="warning-mouse3"
        >
          To use context menu, make sure to tick any modifier keys below.
        </span>
      </div>

      <div class="option">
        <label class="control">don't activate if pressed.. (any)</label>

        <div class="chips" id="non-activation">
          <span>
            <input
              type="checkbox"
              name="ctrl"
              value="ctrl"
              id="non-activate-ctrl"
              checked={props.userOption.scroller.activation.nonActivation.ctrl}
              onChange={onNonActivationChange}
              hidden
            />
            <label class="chip" for="non-activate-ctrl" data-cy="mod-ctrl">
              ctrl
            </label>
          </span>
          <span>
            <input
              type="checkbox"
              name="alt"
              id="non-activate-alt"
              value="alt"
              checked={props.userOption.scroller.activation.nonActivation.alt}
              onChange={onNonActivationChange}
              hidden
            />
            <label class="chip" for="non-activate-alt" data-cy="mod-alt">
              alt
            </label>
          </span>
          <span>
            <input
              type="checkbox"
              name="shift"
              value="shift"
              id="non-activate-shift"
              checked={props.userOption.scroller.activation.nonActivation.shift}
              onChange={onNonActivationChange}
              hidden
            />
            <label class="chip" for="non-activate-shift" data-cy="mod-shift">
              shift
            </label>
          </span>
          <span>
            <input
              type="checkbox"
              name="meta"
              value="meta"
              id="non-activate-meta"
              checked={props.userOption.scroller.activation.nonActivation.meta}
              onChange={onNonActivationChange}
              hidden
            />
            <label class="chip" for="non-activate-meta" data-cy="mod-meta">
              meta
            </label>
          </span>
        </div>
      </div>

      <div class="option" id="option-sensitivity">
        <label class="control">sensitivity (1 - 20)</label>
        <div>
          <button
            class="push"
            onClick={() => changeSensitivity(-1)}
            data-cy="sensitivity-decrease"
          >
            -
          </button>
          <span id="sensitivity-value" data-cy="sensitivity-value">
            {props.userOption.scroller.sensitivity}
          </span>
          <button
            class="push"
            onClick={() => changeSensitivity(1)}
            data-cy="sensitivity-increase"
          >
            +
          </button>
        </div>
      </div>

      <div class="option" id="checkboxes">
        <div class="checkbox">
          <label for="natural-scrolling">
            natural scrolling
            <input
              type="checkbox"
              name="naturalScrolling"
              id="natural-scrolling"
              checked={props.userOption.scroller.naturalScrolling}
              hidden
              onChange={onButtonClick}
            />
            <span class="input-checkbox" data-cy="natural-scrolling" />
          </label>
        </div>
      </div>
    </div>
  )
}

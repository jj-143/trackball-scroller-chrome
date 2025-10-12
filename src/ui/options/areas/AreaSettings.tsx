import OptionActivationCombo from "../segments/ActivationCombo"
import NonActivation from "../segments/NonActivation"
import Sensitivity from "../segments/Sensitivity"
import ScrollerOpions from "../segments/ScrollerOptions"

import L from "../layout.module.scss"

type Props = {
  userOption: UserOption
}

export default function AreaSettings(props: Props) {
  return (
    <section class={L.section}>
      <OptionActivationCombo
        activation={props.userOption.scroller.activation}
      />

      <NonActivation
        nonActivation={props.userOption.scroller.activation.nonActivation}
      />

      <Sensitivity sensitivity={props.userOption.scroller.sensitivity} />

      <ScrollerOpions scroller={props.userOption.scroller} />
    </section>
  )
}

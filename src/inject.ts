import Scroller from "./scroller"
import { Store } from "./store"
import ChromeStorage from "./store/providers/chrome"

async function init() {
  const scroller = new Scroller()
  const store = new Store({
    provider: new ChromeStorage(),
  })

  const settings = await store.getStore()
  scroller.init(settings.userOption.scroller)
  if (settings.enabled) scroller.enable()

  // provide onUpdate callback after initialized
  // to prevent updating before initalized
  store.onUpdate((store) => {
    scroller.updateConfig(store.userOption.scroller)

    if (store.enabled !== scroller.isEnabled) {
      store.enabled ? scroller.enable() : scroller.disable()
    }
  })
}

// Prevent scroller to be run on options page served by a dev server.
//
// Extensions don't get injected on the *real* options page. ('chrome-extension://')
// So we have to explicitly prevent it
// since options page run its own scroller.
const isProduction = process.env.NODE_ENV === "production"
const isOptionsPage =
  (
    document.head.querySelector(
      "meta[name='application-name']"
    ) as HTMLMetaElement
  )?.content === "trackball-scroller-options"

const shouldNotRun = !isProduction && isOptionsPage

if (!shouldNotRun) {
  init()
}

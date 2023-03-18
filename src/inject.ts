import Scroller from "./scroller"
import { Store } from "./store"
import ChromeStorage from "./store/providers/chrome"

function updateScroller(
  scroller: Scroller,
  { enabled, scrollerConfig }: StoreResponse
) {
  scroller.updateConfig(scrollerConfig)
  if (enabled !== scroller.isEnabled) {
    enabled ? scroller.enable() : scroller.disable()
  }
}

function init() {
  const scroller = new Scroller()
  const store = new Store({
    provider: new ChromeStorage(),
  })

  store.onUpdate((store) => {
    updateScroller(scroller, {
      enabled: store.enabled,
      scrollerConfig: store.userOption.scroller,
    })
  })

  store.getStore().then((store) => {
    updateScroller(scroller, {
      enabled: store.enabled,
      scrollerConfig: store.userOption.scroller,
    })
  })
}

// Prevent scroller to be run on options page served by a dev server.
//
// Extensions don't get injected on the *real* options page. ('chrome-extension://')
// So we have to explicitly prevent it
// since options page run its own scroller.
const isDev = process.env.NODE_ENV === "development"
const isOptionsPage =
  (
    document.head.querySelector(
      "meta[name='application-name']"
    ) as HTMLMetaElement
  )?.content === "trackball-scroller-options"
const shouldNotRun = isDev && isOptionsPage

if (!shouldNotRun) {
  init()
}

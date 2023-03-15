import Scroller from "./scroller"
import { Store } from "./store"
import ChromeStorage from "./store/providers/chrome"

export const scroller = new Scroller()

function updateScroller({ enabled, scrollerConfig }: StoreResponse) {
  scroller.updateConfig(scrollerConfig)
  if (enabled !== scroller.isEnabled) {
    enabled ? scroller.enable() : scroller.disable()
  }
}

const store = new Store({
  provider: new ChromeStorage(),
})

store.onUpdate((store) => {
  updateScroller({
    enabled: store.enabled,
    scrollerConfig: store.userOption.scroller,
  })
})

store.getStore().then((store) => {
  updateScroller({
    enabled: store.enabled,
    scrollerConfig: store.userOption.scroller,
  })
})

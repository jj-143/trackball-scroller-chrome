import Scroller from "../scroller"
import { Store } from "../store"
import { InMemoryStorage } from "../store/providers"

export async function initScroller() {
  const scroller = new Scroller()
  const store = new Store({
    provider: window._testStorage ?? new InMemoryStorage(),
  })
  const settings = await store.getStore()

  scroller.init(settings.userOption.scroller)
  scroller.enable()

  store.onUpdate((store) => {
    scroller.updateConfig(store.userOption.scroller)
    if (store.enabled !== scroller.isEnabled) {
      store.enabled ? scroller.enable() : scroller.disable()
    }
  })

  return { scroller, store }
}

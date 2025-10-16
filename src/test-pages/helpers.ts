import Scroller from "../scroller"
import { Store } from "../store"
import { InMemoryStorage } from "../store/providers"

export async function initScroller() {
  const scroller = new Scroller()
  const store = new Store({
    provider: window._testStorage ?? new InMemoryStorage(),
  })
  const settings = await store.get()

  scroller.init(settings.userOption.scroller)
  scroller.enable()

  store.onUpdate((settings) => {
    scroller.updateConfig(settings.userOption.scroller)
    if (settings.enabled !== scroller.isEnabled) {
      settings.enabled ? scroller.enable() : scroller.disable()
    }
  })

  return { scroller, store }
}

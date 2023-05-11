import Scroller from "../../scroller"
import { Store } from "../../store"
import { InMemoryStorage } from "../../store/providers"

async function init() {
  const scroller = new Scroller()
  const store = new Store({
    provider: new InMemoryStorage(),
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

  // simulates disable, allowing a situation of disabling while activated.
  const button = document.getElementById("delayed-disable") as HTMLButtonElement
  button.addEventListener("click", () => {
    setTimeout(() => {
      store.updateStore({
        ...settings,
        enabled: false,
      })
    }, 1000)
  })
}

init()

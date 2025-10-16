import {
  shimPreventActivation,
  updateSettings,
  type Payload,
} from "@/ui/options/utils/utils"
import Scroller from "@/scroller"
import { Store } from "@/store"
import { InMemoryStorage } from "@/store/providers"
import ChromeStorage from "@/store/providers/chrome"

export const CLS_PREVENT_ACTIVATION = "ts-prevent-activation"

function createStore() {
  const notInProduction = import.meta.env.DEV
  const isExtensionPage = window.location.href.startsWith("chrome-extension://")
  const useInMemoryStorage = notInProduction && !isExtensionPage

  const provider = useInMemoryStorage
    ? window._testStorage ?? new InMemoryStorage()
    : new ChromeStorage()

  return new Store({
    provider,
  })
}

class API {
  store: Store
  private scroller?: Scroller

  constructor() {
    this.store = createStore()
  }

  initStore(): Promise<UserSettings> {
    return this.store.getStore()
  }

  initScroller() {
    this.scroller = new Scroller()
    shimPreventActivation(this.scroller, CLS_PREVENT_ACTIVATION)

    this.store.getStore().then((settings) => {
      this.scroller?.init(settings.userOption.scroller)
      this.scroller?.enable()
    })

    const unsubStoreUpdate = this.store.onUpdate((store) => {
      this.scroller?.updateConfig(store.userOption.scroller)
    })

    return () => {
      unsubStoreUpdate()
      this.scroller?.disable()
      delete this.scroller
    }
  }

  updateSettings<T extends keyof Payload>(type: T, payload: Payload[T]) {
    updateSettings(this.store, type, payload)
  }
}

const api = new API()

export default api

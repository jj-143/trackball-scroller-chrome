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

function initStore() {
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
  settings!: UserSettings
  private store!: Store
  private scroller?: Scroller

  async init() {
    this.store = initStore()
    this.settings = await this.store.getStore()
    this.store.onUpdate((store) => (this.settings = store))
  }

  async initScroller() {
    const settings = await this.store.getStore()

    this.scroller = new Scroller()
    shimPreventActivation(this.scroller, CLS_PREVENT_ACTIVATION)

    this.scroller.init(settings.userOption.scroller)
    this.scroller.enable()
    this.store.onUpdate((store) => {
      this.scroller!.updateConfig(store.userOption.scroller)
    })
  }

  onUpdate(
    callback: (userSettings: UserSettings, old?: UserSettings) => void
  ): () => void {
    return this.store.onUpdate(callback)
  }

  cleanupScroller() {
    this.scroller?.disable()
  }

  updateSettings<T extends keyof Payload>(type: T, payload: Payload[T]) {
    updateSettings(this.store, type, payload)
  }
}

const api = new API()

export default api

import { Store } from "../store"
import ChromeStorage from "../store/providers/chrome"

export default class Extension {
  store: Store

  constructor() {
    this.store = new Store({
      provider: new ChromeStorage(),
    })
  }
}

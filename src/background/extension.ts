import { Store } from "../store"

export default class Extension {
  store: Store

  constructor() {
    this.store = new Store()
  }
}

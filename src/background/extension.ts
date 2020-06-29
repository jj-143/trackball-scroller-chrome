import { Store } from "../store"

export default class Extension {
  store: Store
  tabs: number[]

  constructor() {
    this.store = new Store()
    this.tabs = []
  }

  addTab(tabId: number) {
    this.tabs.push(tabId)
  }
}

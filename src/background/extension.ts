import { Store } from "../store"

export default class Extension {
  store: Store
  tabs: string[]

  constructor() {
    this.store = new Store()
    this.tabs = []
  }

  addTab(tabId: string) {
    //TODO
    this.tabs.push(tabId)
  }
}

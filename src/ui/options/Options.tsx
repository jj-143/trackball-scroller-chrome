import "./options.css"

import { useEffect, useState } from "preact/hooks"
import { store } from "./options"
import { DEFAULT_USER_SETTINGS } from "@/store"
import Scroller from "@/scroller"
import AreaScrollTest from "./components/AreaScrollTest"
import AreaSettings from "./components/AreaSettings"

const scroller = new Scroller()

// Bypass trigger on the "customize activation" button
scroller.checkTrigger = function (e: MouseEvent) {
  const elm = e.target as Element
  const originalFn = Scroller.prototype.checkTrigger.bind(scroller)
  if (elm.classList.contains("activation")) {
    return
  }
  return originalFn(e)
}

const settings = await store.getStore()

scroller.init(settings.userOption.scroller)
scroller.enable() // always enable in Options page

export default function Options() {
  const [userOption, setUserOption] = useState(DEFAULT_USER_SETTINGS.userOption)

  useEffect(() => {
    store.getStore().then((settings) => setUserOption(settings.userOption))

    const cleanupUpdate = store.onUpdate((settings) => {
      setUserOption(settings.userOption)
      scroller.updateConfig(settings.userOption.scroller)
    })

    return () => {
      scroller.disable()
      cleanupUpdate()
    }
  }, [])

  return (
    <>
      <header>
        <img src="/assets/icon-options.svg" alt="logo" />
        <span id="title">Trackball Scroller</span>
        <span id="menu">- Options -</span>
      </header>

      <main>
        <AreaSettings userOption={userOption} />
        <AreaScrollTest />
      </main>
    </>
  )
}

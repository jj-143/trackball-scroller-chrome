import "./options.css"

import { useEffect, useState } from "preact/hooks"
import AreaScrollTest from "./components/AreaScrollTest"
import AreaSettings from "./components/AreaSettings"
import api from "../api"

await api.init()

export default function Options() {
  const [userOption, setUserOption] = useState(api.settings.userOption)

  useEffect(() => {
    return api.onUpdate((settings) => setUserOption(settings.userOption))
  }, [])

  // Options page always enable scroller
  useEffect(() => {
    api.initScroller()
    return api.cleanupScroller
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

import { useEffect, useState } from "preact/hooks"
import AreaScrollTest from "./areas/AreaScrollTest"
import AreaSettings from "./areas/AreaSettings"
import api from "../api"

import L from "./layout.module.scss"

import "./options.css"

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
      <header class={L.header}>
        <img src="/assets/icon-options.svg" alt="logo" />
        <h1 class={L.title}>Trackball Scroller</h1>
        <h2 class={L.subtitle}>- Options -</h2>
      </header>

      <main class={L.main}>
        <AreaSettings userOption={userOption} />
        <AreaScrollTest />
      </main>
    </>
  )
}

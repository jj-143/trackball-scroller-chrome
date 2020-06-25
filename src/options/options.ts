import { saveSettings, getSettings, updateDOM } from "./utils/page"
import "../inject"

let settings: UserSettings

getSettings().then((settings_) => {
  settings = settings_
  updateDOM(settings)
})

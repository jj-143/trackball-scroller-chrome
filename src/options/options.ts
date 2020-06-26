import { saveSettings, getSettings } from "./utils/utils"
import { updateDOM, makeTestArticles } from "./utils/page"
import "../inject"

let settings: UserSettings

makeTestArticles()

getSettings().then((settings_) => {
  settings = settings_
  updateDOM(settings)
})

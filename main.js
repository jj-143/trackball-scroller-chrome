const isOptionsPage =
  location.href.search("^chrome-extension://.*/options.html$") === 0

// copy of chrome.setting; from option.
var setting

// 'local state' - state for each tab OR page
var state = {
  scrolling: false,
}

function loadSetting(cb) {
  chrome.storage.sync.get("setting", ({ setting: storageSetting }) => {
    setting = storageSetting

    if (cb) {
      cb()
    }
  })
}

var scrollTarget = null

/* also fired when tab changed */
function handleMouseMovement(e) {
  // handle Escape cancelled pointer lock
  if (!document.pointerLockElement && state.scrolling) {
    state.scrolling = false
    deActivateScrollMode()
    return
  }
  if (e.movementY == 0) return

  var y = e.movementY * (setting.naturalScrolling.value ? -1 : 1)
  scrollTarget.scrollBy(0, y)
}

function captureClick(e) {
  e.preventDefault()
  e.stopPropagation()
  window.removeEventListener("click", captureClick, true)
  deActivateScrollMode()
}

function activateScrollMode() {
  document.body.requestPointerLock()
  window.addEventListener("mousemove", handleMouseMovement, false)
}

function deActivateScrollMode() {
  window.removeEventListener("mousemove", handleMouseMovement, false)
  document.exitPointerLock()
}

function handleClick(e) {
  // 0: left, 1: middle, 2: right

  // enabling mouse 0 click on activation button
  if (isOptionsPage && e.target.id === "activation") {
    return
  }

  if (state.scrolling) {
    state.scrolling = false

    if (e.button == 0) {
      window.addEventListener("click", captureClick, true)
      return
    }
    e.preventDefault()
    deActivateScrollMode()
    return
  } else {
    if (
      e.button == setting.activation.input.key &&
      setting.activation.modifiers.every((key) => e.getModifierState(key)) &&
      !setting.nonActivation.some((key) => e.getModifierState(key))
    ) {
      const path = e.composedPath()
      anchor = path.find((elm) => elm.tagName == "A")

      if (anchor && anchor.href) {
        return
      }

      // need both to work without erratic behavior
      e.preventDefault()
      e.stopPropagation()
      state.scrolling = true

      // default target if no specific area.
      scrollTarget = document.scrollingElement

      for (var i = 0; i < path.length - 2; i++) {
        var p = path[i]

        // also detecting "auto" and non-scrollable element; pass and go higher.
        if (
          (getComputedStyle(p).overflowY == "auto" ||
            getComputedStyle(p).overflowY == "scroll") &&
          p.clientHeight != p.scrollHeight
        ) {
          // change to HTML only scrollingElement is also HTML
          if (
            p.tagName == "BODY" &&
            document.scrollingElement.tagName == "HTML"
          ) {
            scrollTarget = document.documentElement
          } else {
            scrollTarget = p
          }
          break
        }
      }

      activateScrollMode()
    }
  }
  return false
}

function preventContextMenu(e) {
  if (state.scrolling) {
    e.preventDefault()
    return false
  }
}

function attachFeature() {
  addEventListener("mousedown", handleClick, true)
  addEventListener("contextmenu", preventContextMenu, true)
}

function detachFeature() {
  removeEventListener("mousedown", handleClick, true)
  removeEventListener("contextmenu", preventContextMenu, true)
}

// Init
scrollTarget = document.documentElement

loadSetting(() => {
  // Sync Setting
  // @ setting changed
  // @ enabled / disabled via BrowserAction
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.setting) {
      setting = changes.setting.newValue
    } else if (changes.enabled) {
      if (changes.enabled.newValue) {
        attachFeature()
      } else {
        detachFeature()
      }
    }
  })

  // start
  chrome.storage.sync.get("enabled", ({ enabled }) => {
    if (enabled) {
      attachFeature()

      // DEV: Cancelled. start in scroll
      // if (setting.startInScroll.value) {
      //   // TODO: check "main" scroll area.
      //   // currently scrolltarget.

      //   //TODO: scrollTarget to set in [state]
      //   scrollTarget = document.scrollingElement
      //   console.log("startinscroll.")
      //   state.scrolling = true
      //   activateScrollMode()
      // }
    }
  })
})

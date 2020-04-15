const isOptionsPage =
  location.href.search("^chrome-extension://.*/options.html$") === 0

// copy of chrome.setting; from option.
var setting

// 'local state' - state for each tab OR page
var state = {
  scrolling: false,
  scrollTarget: null,
}

function _isOnViewport(elm) {
  var rect = elm.getBoundingClientRect()

  // or document.documentElement.clientWidth. (check browser support; chrome supports below)
  var viewportWidth = window.innerWidth
  var viewportHeight = window.innerHeight

  return (
    rect.width &&
    rect.height &&
    ((rect.left < 0 && rect.left + rect.width > 0) ||
      (0 <= rect.left && rect.left < viewportWidth)) &&
    ((rect.top < 0 && rect.top + rect.height > 0) ||
      (0 <= rect.top && rect.top < viewportHeight))
  )
}

function _isScrollable(elm) {
  var diff = elm.scrollHeight - elm.clientHeight
  var style = getComputedStyle(elm).overflowY

  return {
    value:
      diff > 50 && style != "hidden" && (style == "auto" || style == "scroll"),
    info: "(" + diff + "," + style + ")",
  }
}

function _searchTarget() {
  var found = []

  document.body.querySelectorAll("*").forEach((elm) => {
    if (_isScrollable(elm).value && _isOnViewport(elm)) {
      found.push(elm)
    }
  })

  return found
}

function autoTargetScrollingElement() {
  var diffHTML =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight

  var styleHTML = getComputedStyle(document.documentElement).overflowY

  var diffBODY = document.body.scrollHeight - document.body.clientHeight
  var styleBODY = getComputedStyle(document.body).overflowY

  if (
    ((diffHTML != 0 || diffBODY != 0) && styleHTML === "hidden") ||
    styleBODY === "hidden"
  ) {
    var found = _searchTarget()

    if (found.length) {
      //TODO: get biggest.
      target = found[0]
    }
  } else if (diffHTML == 0 && diffBODY == 0) {
    // no scroll (options) -> 바디에서 찾고 풀Width? 아니면 말기.
    target = null
  } else {
    target = window
  }

  return target
}

function loadSetting(cb) {
  chrome.storage.sync.get("setting", ({ setting: storageSetting }) => {
    setting = storageSetting

    if (cb) {
      cb()
    }
  })
}

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
  state.scrollTarget.scrollBy(0, y)
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

function handleMouseCancel(e) {
  if (state.scrolling) {
    state.scrolling = false
    deActivateScrollMode()
  }
}

function handleKeyActivation(e) {
  if (state.scrolling) {
    // cancel ONLY IF exact right combo.
    if (
      e.key == setting.activation.input.key &&
      setting.activation.modifiers.every((key) => e.getModifierState(key)) &&
      !setting.nonActivation.some((key) => e.getModifierState(key))
    ) {
      state.scrolling = false
      deActivateScrollMode()
    }
  } else {
    if (
      e.key == setting.activation.input.key &&
      setting.activation.modifiers.every((key) => e.getModifierState(key)) &&
      !setting.nonActivation.some((key) => e.getModifierState(key))
    ) {
      state.scrollTarget = autoTargetScrollingElement()
      if (!state.scrollTarget) return

      state.scrolling = true
      activateScrollMode()
    }
  }
}

function handleClick(e) {
  // 0: left, 1: middle, 2: right

  // enabling mouse 0 click on activation button
  if (isOptionsPage && e.target.id === "activation") {
    return
  }

  // "canceling with any mouse button"
  if (state.scrolling) {
    state.scrolling = false

    // prevent weird click effect when click right after activate without moving
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
      state.scrollTarget = document.scrollingElement

      for (var i = 0; i < path.length - 2; i++) {
        var p = path[i]

        // also detecting "auto" and non-scrollable element; pass and go higher.
        if (
          (getComputedStyle(p).overflowY == "auto" ||
            getComputedStyle(p).overflowY == "scroll") &&
          p.clientHeight < p.scrollHeight
        ) {
          // change to HTML only scrollingElement is also HTML
          if (
            p.tagName == "BODY" &&
            document.scrollingElement.tagName == "HTML"
          ) {
            state.scrollTarget = document.documentElement
          } else {
            state.scrollTarget = p
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

/**
 * NOTE: set mouse on startup -> attach()
 *  attach() {
 *   add to current
 * }
 * detach() {
 *  remove current
 * }
 * change option to key -> "onActivationChanged {
 *    1. remove BOTH mouse, key
 *    2. attach the current(changed to) option.
 * }"
 *
 */

function attachFeature(type) {
  if (type === "mouse") {
    addEventListener("mousedown", handleClick, true)
    addEventListener("contextmenu", preventContextMenu, true)
  } else {
    // key activated
    addEventListener("keydown", handleKeyActivation, true)
    addEventListener("mousedown", handleMouseCancel, true)
  }
}

function detachFeature(type) {
  if (type === "mouse") {
    removeEventListener("mousedown", handleClick, true)
    removeEventListener("contextmenu", preventContextMenu, true)
  } else {
    removeEventListener("keydown", handleKeyActivation, true)
    removeEventListener("mousedown", handleMouseCancel, true)
    // key activated
  }
}

function isActivationByMouse(storageSetting) {
  // check given argument OR check chrome.sync.storage by yourself
  // then check is activation by mouse.
  // storageSetting.

  if (!storageSetting) {
    storageSetting = setting
  }

  return storageSetting.activation.input.type === "mouse"
}

// Init
state.scrollTarget = document.scrollingElement

loadSetting(() => {
  // Sync Setting
  // @ setting changed
  // @ enabled / disabled via BrowserAction
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.setting) {
      setting = changes.setting.newValue

      /**
       * NOTE: I could merge with below but separate these for now.
       */

      // if changes involved with activation combo = activation.type

      // if change is mouse -> keyboard, or vice-versa
      // if changes.setting.newValue.type != oldvalue.type

      const oldType = changes.setting.oldValue.activation.input.type
      const newType = changes.setting.newValue.activation.input.type

      if (oldType !== newType) {
        // if new activation input type is not mouse, it's keydown (for now)
        detachFeature(oldType)
        attachFeature(newType)
      }
    } else if (changes.enabled) {
      const activationType = setting.activation.input.type

      if (changes.enabled.newValue) {
        attachFeature(activationType)
      } else {
        detachFeature(activationType)
      }
    }
  })

  // startup start feature, if it's enabled.
  // it's in loadSetting() so it's not empty setting state.
  chrome.storage.sync.get("enabled", ({ enabled }) => {
    if (enabled) {
      attachFeature(setting.activation.input.type)

      // DEV: Cancelled. start in scroll
      // if (setting.startInScroll.value) {
      //   // TODO: check "main" scroll area.
      //   // currently scrolltarget.

      //   //TODO: scrollTarget to set in [state]
      //   state.scrollTarget = document.scrollingElement
      //   console.log("startinscroll.")
      //   state.scrolling = true
      //   activateScrollMode()
      // }
    }
  })
})

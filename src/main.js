console.log("main", new Date())

const isOptionsPage =
  location.href.search("^chrome-extension://.*/options.html$") === 0

// copy of chrome.setting; from option.
var setting

// 'local state' - state for each tab OR page
var state = {
  scrolling: false,
  scrollTarget: null,
  smoothScrollElements: [],
}

function _stripSmoothScroll(elm) {
  elm.style.scrollBehavior = "auto"
  state.smoothScrollElements.push(elm)
}

function _reverseSmoothScroll() {
  if (state.smoothScrollElements.length) {
    state.smoothScrollElements.forEach((elm) => (elm.style = ""))
    state.smoothScrollElements = []
  }
}

function _isOnViewport(elm) {
  var rect = elm.getBoundingClientRect()

  // window.innerWidth or document.documentElement.clientWidth. (check browser support; chrome supports below)
  return (
    (rect.left * rect.right < 0 ||
      (rect.right > 0 && rect.right < window.innerWidth)) &&
    (rect.top * rect.bottom < 0 ||
      (rect.bottom > 0 && rect.bottom < window.innerHeight))
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

function __computeVisibleArea(elm) {
  // elm is entirely / partially visible on the viewport
  var rect = elm.getBoundingClientRect()
  var visibleLeft = Math.max(rect.left, 0)
  var visibleRight = Math.min(rect.right, window.innerWidth)
  var visibleTop = Math.max(rect.top, 0)
  var visibleBottom = Math.min(rect.bottom, window.innerHeight)
  return (visibleRight - visibleLeft) * (visibleBottom - visibleTop)
}

function _searchTarget() {
  const excludes = ["A", "SPAN", "P", "H1", "H2", "I"]

  var found = document.body
    .querySelectorAll("*")
    .filter(
      (elm) =>
        !excludes.includes(elm.tagName) &&
        _isScrollable(elm).value &&
        _isOnViewport(elm)
    )

  // sort by screen area, descending order
  found.sort((a, b) => __computeVisibleArea(b) - __computeVisibleArea(a))

  return found
}

function autoTargetScrollingElement() {
  var diffHTML =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight
  var diffBODY = document.body.scrollHeight - document.body.clientHeight
  var overflowHTML = getComputedStyle(document.documentElement).overflowY
  var overflowBODY = getComputedStyle(document.body).overflowY

  // "overflow: hidden" with difference in height meaning
  // there's modal-like content acting as "body".
  // (e.g click post on reddit; different from comment page)
  // so find that element (usually the biggest one)
  if (
    ((diffHTML != 0 || diffBODY != 0) && overflowHTML === "hidden") ||
    overflowBODY === "hidden"
  ) {
    var found = _searchTarget()

    if (found.length) {
      //TODO: get biggest.
      target = found[0]
    }
  } else if (diffHTML == 0 && diffBODY == 0) {
    // the page is "full page" (no scroll)
    // NOTE: there can be scollable elements but it's not the "intended" content.
    // so don't search target, for now.
    target = null
  } else {
    // natural scroll target
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

  var y =
    e.movementY *
    (setting.naturalScrolling.value ? -1 : 1) *
    setting.sensitivityValue
  state.scrollTarget.scrollBy(0, y)
}

function captureClick(e) {
  e.preventDefault()
  e.stopPropagation()
  window.removeEventListener("click", captureClick, true)
  deActivateScrollMode()
}

function activateScrollMode() {
  // strip smooth scroll.
  if (
    state.scrollTarget == window ||
    state.scrollTarget.tagName == "BODY" ||
    state.scrollTarget.tagName == "HTML"
  ) {
    if (
      getComputedStyle(document.documentElement).scrollBehavior === "smooth"
    ) {
      _stripSmoothScroll(document.documentElement)
    }

    if (getComputedStyle(document.body).scrollBehavior === "smooth") {
      _stripSmoothScroll(document.body)
    }
  } else {
    if (getComputedStyle(state.scrollTarget).scrollBehavior === "smooth") {
      _stripSmoothScroll(state.scrollTarget)
    }
  }

  document.body.requestPointerLock()
  window.addEventListener("mousemove", handleMouseMovement, false)
}

function deActivateScrollMode() {
  _reverseSmoothScroll()
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
  if (isOptionsPage && e.target.className === "activation") {
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

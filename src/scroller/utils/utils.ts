export function preventDefault(e) {
  e.preventDefault()
}

export function preventContextMenu() {
  addEventListener("contextmenu", preventDefault, true)
}

export function allowContextMenu() {
  removeEventListener("contextmenu", preventDefault, true)
}

/**
 * TODO: seems inefficient. maybe top-down search?
 *
 * One awkward behavior:
 * This called there is "modal" opened.
 * but when the modal is short, no scroller, the biggest element
 * in the "backdropped" area scrolled. check: https://getbootstrap.com/docs/4.5/components/modal/
 */
export function searchTarget(): Element[] {
  var found = []

  const searchExcludes = ["A", "SPAN", "P", "H1", "H2", "I"]
  document.body.querySelectorAll("*").forEach((elm) => {
    if (
      !searchExcludes.includes(elm.tagName) &&
      isScrollable(elm).value &&
      isOnViewport(elm)
    ) {
      found.push(elm)
    }
  })
  // sort by screen area, descending order
  found.sort((a, b) => computeVisibleArea(b) - computeVisibleArea(a))

  return found
}

function computeVisibleArea(elm): number {
  var rect = elm.getBoundingClientRect()

  var visibleLeft = Math.max(rect.left, 0)
  var visibleRight = Math.min(rect.right, window.innerWidth)

  var visibleTop = Math.max(rect.top, 0)
  var visibleBottom = Math.min(rect.bottom, window.innerHeight)

  return (visibleRight - visibleLeft) * (visibleBottom - visibleTop)
}

function isOnViewport(elm: Element) {
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

function isScrollable(elm: Element) {
  var diff = elm.scrollHeight - elm.clientHeight
  var style = getComputedStyle(elm).overflowY

  return {
    value:
      diff > 50 && style != "hidden" && (style == "auto" || style == "scroll"),
    info: "(" + diff + "," + style + ")",
  }
}

let strippedSmoothScroll: [HTMLElement, string][] = []

export function preventDefault(e: Event) {
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
export function searchTarget(): HTMLElement[] {
  const found: HTMLElement[] = []

  const searchExcludes = ["A", "SPAN", "P", "H1", "H2", "I"]
  // FIXME: assuming HTMLElement for now.
  document.body.querySelectorAll<HTMLElement>("*").forEach((elm) => {
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

function computeVisibleArea(elm: Element): number {
  const rect = elm.getBoundingClientRect()

  const visibleLeft = Math.max(rect.left, 0)
  const visibleRight = Math.min(rect.right, window.innerWidth)

  const visibleTop = Math.max(rect.top, 0)
  const visibleBottom = Math.min(rect.bottom, window.innerHeight)

  return (visibleRight - visibleLeft) * (visibleBottom - visibleTop)
}

function isOnViewport(elm: Element) {
  const rect = elm.getBoundingClientRect()

  // or document.documentElement.clientWidth. (check browser support; chrome supports below)
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

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
  const diff = elm.scrollHeight - elm.clientHeight
  const style = getComputedStyle(elm).overflowY

  return {
    value:
      diff > 50 && style != "hidden" && (style == "auto" || style == "scroll"),
    info: "(" + diff + "," + style + ")",
  }
}

function _stripSmoothScroll(elm: HTMLElement) {
  if (getComputedStyle(elm).scrollBehavior === "smooth") {
    strippedSmoothScroll.push([elm, elm.style.scrollBehavior])
    elm.style.scrollBehavior = "auto"
  }
}

export function stripSmoothScroll(scrollTarget: ScrollTarget | null) {
  if (!scrollTarget) return
  const isNaturalTarget =
    scrollTarget == window ||
    (scrollTarget as HTMLElement).tagName == "BODY" ||
    (scrollTarget as HTMLElement).tagName == "HTML"
  if (isNaturalTarget) {
    _stripSmoothScroll(document.documentElement)
    _stripSmoothScroll(document.body)
  } else {
    _stripSmoothScroll(scrollTarget as HTMLElement)
  }
}

export function revertSmoothScroll() {
  strippedSmoothScroll.forEach(
    ([elm, value]) => (elm.style.scrollBehavior = value)
  )
  strippedSmoothScroll = []
}

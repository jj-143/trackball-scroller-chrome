import { isFromAnchor } from "./isFromAnchor"
import { searchTarget } from "./utils"

export function findTarget(e: MouseEvent | KeyboardEvent): ScrollTarget {
  if (e.type.startsWith("mouse")) {
    const path = e.composedPath()
    if (isFromAnchor(path)) return
    return findTargetFromPath(path)
  } else {
    return autoTarget()
  }
}

function findTargetFromPath(path: EventTarget[]): HTMLElement {
  let target = document.scrollingElement as HTMLElement

  // until [html]; without document, Window
  for (var i = 0; i < path.length - 2; i++) {
    var elm = path[i] as HTMLElement
    // also detecting "auto" and non-scrollable element; pass and go higher.
    if (
      (getComputedStyle(elm).overflowY === "auto" ||
        getComputedStyle(elm).overflowY === "scroll") &&
      elm.clientHeight < elm.scrollHeight
    ) {
      // change to HTML only scrollingElement is also HTML
      if (
        elm.tagName === "BODY" &&
        document.scrollingElement.tagName === "HTML"
      ) {
        target = document.documentElement
      } else {
        target = elm
      }
      break
    }
  }

  return target
}

function autoTarget(): ScrollTarget | void {
  const diffHTML =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight
  const styleHTML = getComputedStyle(document.documentElement).overflowY
  const diffBODY = document.body.scrollHeight - document.body.clientHeight
  const styleBODY = getComputedStyle(document.body).overflowY

  const isThereCoveringScrollingElement =
    ((diffHTML != 0 || diffBODY != 0) && styleHTML === "hidden") ||
    styleBODY === "hidden"

  if (isThereCoveringScrollingElement) {
    const found = searchTarget()
    return found.length ? found[0] : null
  }

  if (diffHTML == 0 && diffBODY == 0) {
    // no scroller on body.
    // but the page is full-heighted with scrollable area, like it's options page.
    // we could set the biggest as target but we don't, for now.
    // implementing last active(clicked) element resolve these kind of pages.
    return null
  } else {
    return window
  }
}

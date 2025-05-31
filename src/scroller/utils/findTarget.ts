import { isFromAnchor } from "./isFromAnchor"
import {
  isScrollable,
  isViewportScrollHidden,
  isViewportScrollable,
  searchTarget,
} from "./utils"

export function findTarget(e: MouseEvent | KeyboardEvent): ScrollTarget | null {
  if (e.type.startsWith("mouse")) {
    const path = e.composedPath()
    if (isFromAnchor(path)) return null
    return findTargetFromPath(path)
  } else {
    return autoTarget()
  }
}

function findTargetFromPath(path: EventTarget[]): HTMLElement {
  let target =
    (document.scrollingElement as HTMLElement | null) ??
    // null only happens in non-standard mode; otherwise, it's document.documentElement.
    // (see: https://developer.mozilla.org/en-US/docs/Web/API/document/scrollingElement)
    // just fallback to documentElement in that case.
    document.documentElement

  // until [html]; without document, Window
  for (let i = 0; i < path.length - 2; i++) {
    const elm = path[i] as HTMLElement
    // skip shadow root
    if (elm.nodeType === Node.DOCUMENT_FRAGMENT_NODE) continue

    // also detecting "auto" and non-scrollable element; pass and go higher.
    if (isScrollable(elm)) {
      // change to HTML only scrollingElement is also HTML
      if (
        elm.tagName === "BODY" &&
        document.scrollingElement?.tagName === "HTML"
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

function autoTarget(): ScrollTarget | null {
  // A: If the viewport(<html> | <body>) is covered by an overlay element,
  // (e.g, <body>'s overflow "hidden" to show a modal)
  // then search and return the target.
  if (isViewportScrollHidden()) {
    return searchTarget()[0]
  }

  // B: If the viewport has a scroller, return Window.
  // This is the most common case where the document has a long body content.
  if (isViewportScrollable()) {
    return window
  }

  // C: As a last resort, find largest scrollable
  const found = searchTarget()
  if (found.length) {
    return found[0]
  }

  // D: Nothing scrollable
  return null
}

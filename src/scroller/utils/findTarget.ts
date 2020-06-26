export function findTarget(path: EventTarget[]): Element {
  let target = document.scrollingElement

  for (var i = 0; i < path.length - 2; i++) {
    var elm = path[i] as Element

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

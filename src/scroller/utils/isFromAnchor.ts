export function isFromAnchor(path: EventTarget[]): boolean {
  // removed checking [anchor.href] for some sites
  return path.find((elm) => (elm as HTMLElement).tagName == "A") !== undefined
}

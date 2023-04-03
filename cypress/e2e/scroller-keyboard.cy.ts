import "cypress-real-events/support"
import { InMemoryStorage } from "../../src/store/providers"
import { createStorageData } from "../fixtures/storage"

let storage: InMemoryStorage

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

beforeEach(() => {
  // to intercept and provide user storage fixture
  storage = new InMemoryStorage()
  cy.visit("/options/options.html", {
    onBeforeLoad(window) {
      window._testStorage = storage
    },
  })
})

describe("Browser Test for scroller : Keyboard", () => {
  context("Activation", () => {
    it("should activate & scroll with mouse moves", async () => {
      await storage.save(createStorageData({ type: "keyboard", button: "e" }))

      // need an focused Element to use `realPress`.
      // note: checking trigger is bypassed on activation button.
      cy.get("button:not(.activation)").first().focus()

      // need an Element to use `realMouseMove`.
      // Element on top of the page to stay at the top.
      const header = cy.get("header")

      // initialize mouse position
      header.realMouseMove(0, 0)

      // --- test

      // activation
      cy.realPress("e")

      // should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })

      // move mouse up by 100
      header.realMouseMove(0, -100)

      // should scroll
      cy.get("html").then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })
    })
  })
})

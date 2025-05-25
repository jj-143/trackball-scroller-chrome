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

// Provide scroller with keyboard activation
beforeEach(() => {
  storage = new InMemoryStorage()

  new Cypress.Promise((resolve) => {
    storage
      .save(createStorageData({ type: "keyboard", button: "e" }))
      .then(resolve)
  })

  // NOTE: Keyboard only supports viewport scroll
  // So make it mobile size to make viewport scrollable
  cy.viewport(350, 750)
  cy.visit("/options/options.html", {
    onBeforeLoad(window) {
      window._testStorage = storage
    },
  })
})

describe("Options page scroll test, keyboard", () => {
  context("Activation", () => {
    it("should activate & scroll with mouse moves", () => {
      const body = cy.get("body").realClick({
        button: "left",
        position: "topLeft",
      })

      // Activation
      cy.realPress("e")

      // Scroll down
      body.realMouseMove(0, -100, { position: "topLeft" })

      // Should scroll
      cy.get("html").then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Deactivation", () => {
    // For each test, enter into scroll mode
    beforeEach(() => {
      cy.get("body").realClick({
        button: "left",
        position: "topLeft",
      })

      cy.realPress("e")
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      cy.get("body")
        // Deactivation
        .realClick({ button: "left", position: "topLeft" })

        // Scroll down
        .realMouseMove(0, -100, { position: "topLeft" })

      // Should NOT scroll
      cy.get("html").then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.equal(0)
      })

      // Should NOT have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should deactivate with activation combo", () => {
      // Deactivation
      cy.realPress("e")

      cy.get("body")
        // Scroll down
        .realMouseMove(0, -100, { position: "topLeft" })

      // Should NOT scroll
      cy.get("html").then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.equal(0)
      })

      // Should NOT have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should NOT deactivate with wrong combo", () => {
      // Try deactivation
      cy.realPress("a")

      cy.get("body")
        // Scroll down
        .realMouseMove(0, -100, { position: "topLeft" })

      // Should scroll
      cy.get("html").then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

      // Should have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })
})

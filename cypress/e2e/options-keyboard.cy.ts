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

// Mobile-sized viewport shows scroller on viewport
describe("Options page scroll test (viewport), keyboard", () => {
  // Provide scroller with keyboard activation
  beforeEach(() => {
    storage = new InMemoryStorage()

    new Cypress.Promise((resolve) => {
      storage
        .save(createStorageData({ type: "keyboard", button: "e" }))
        .then(resolve)
    })

    cy.viewport(350, 750)
    cy.visit("/options/options.html", {
      onBeforeLoad(window) {
        window._testStorage = storage
      },
    })
  })
  context("Activation", () => {
    it("should activate & scroll with mouse moves", () => {
      // Focus for `cy.realPress()`
      const body = cy.get("body").realClick({
        position: "top",
      })

      // Activation
      cy.realPress("e")

      // Scroll down
      body.realMouseMove(0, -100, { position: "top" })

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
    // Enter into scroll mode
    beforeEach(() => {
      // Focus for `cy.realPress()`
      cy.get("body").realClick({
        position: "top",
      })
      // Activation
      cy.realPress("e")
      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      cy.get("body")
        // Deactivation
        .realClick({ position: "top" })

        // Scroll down
        .realMouseMove(0, -100, { position: "top" })

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
        .realMouseMove(0, -100, { position: "top" })

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
        .realMouseMove(0, -100, { position: "top" })

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

// No viewport scroller, but has an scroll element
describe("Options page scroll test (#test-context), keyboard", () => {
  // Provide scroller with keyboard activation
  beforeEach(() => {
    storage = new InMemoryStorage()

    new Cypress.Promise((resolve) => {
      storage
        .save(createStorageData({ type: "keyboard", button: "e" }))
        .then(resolve)
    })

    cy.viewport(1200, 1080)
    cy.visit("/options/options.html", {
      onBeforeLoad(window) {
        window._testStorage = storage
      },
    })
  })

  context("Activation", () => {
    it("should activate & scroll with mouse moves", () => {
      // Focus for `cy.realPress()`
      cy.get("body").realClick()

      // Activation
      cy.realPress("e")

      // Scroll down
      cy.get("#test-context")
        .realMouseMove(0, -100, { position: "top" })

        // Should scroll
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.be.above(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should scroll horizontally", () => {
      // Focus for `cy.realPress()`
      cy.get("body").realClick()

      // Activation
      cy.realPress("e")

      // Scroll down & right
      cy.get("#test-context")
        .realMouseMove(-100, -100, { position: "topLeft", shiftKey: true })

        // Should scroll to only right
        .then(($element) => {
          const top = $element.get(0).scrollTop
          const left = $element.get(0).scrollLeft
          expect(top).to.equal(0)
          expect(left).to.be.above(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Deactivation", () => {
    // Enter into scroll mode
    beforeEach(() => {
      // Focus for `cy.realPress()`
      cy.get("body").realClick()
      // Activation
      cy.realPress("e")
      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      // Deactivation
      cy.get("body").realClick()

      // Scroll down
      cy.get("#test-context")
        .realMouseMove(0, -100, { position: "top" })

        // Should NOT scroll
        .then(($element) => {
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

      cy.get("#test-context")
        // Scroll down
        .realMouseMove(0, -100, { position: "top" })

        // Should NOT scroll
        .then(($element) => {
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

      cy.get("#test-context")
        // Scroll down
        .realMouseMove(0, -100, { position: "top" })

        // Should scroll
        .then(($element) => {
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

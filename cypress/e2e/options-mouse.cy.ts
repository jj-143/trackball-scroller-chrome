import "cypress-real-events/support"

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

beforeEach(() => {
  cy.visit("/options/options.html")
})

describe("Options page scroll test, mouse", () => {
  context("Activation", () => {
    it("should activate & scroll with mouse moves", () => {
      cy.get("#test-context")
        // Activation
        .realClick({ button: "middle", position: "top" })

        // Scroll down
        .realMouseMove(0, -100)

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
  })

  context("Deactivation", () => {
    beforeEach(() => {
      // Activation
      cy.get("#test-context").realClick({ button: "middle", position: "top" })

      // Should have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      // Deactivate
      cy.get("#test-context").realClick({ button: "left", position: "top" })

      // --- test
      cy.get("#test-context")
        .realMouseMove(0, -100)

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

    it("should deactivate with the activation combo", () => {
      // Deactivate
      cy.get("#test-context").realClick({ button: "middle", position: "top" })

      cy.get("#test-context")
        .realMouseMove(0, -100)

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

    it("should deactivate when exited by user agent", () => {
      // Simulates exit by user agent, such as ESC press, window lose focus,
      // etc.
      cy.document().then((document) => {
        document.exitPointerLock()
      })

      cy.get("#test-context")
        // Scroll down
        .realMouseMove(0, -100)

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
  })
})

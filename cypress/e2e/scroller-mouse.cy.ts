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

describe("Browser Test for scroller : Mouse", () => {
  context("Activation", () => {
    it("should activate & scroll with mouse moves", () => {
      cy.get("#test-context")
        // activation & initialize mouse position to y = 0
        .realClick({ button: "middle", position: "top" })

        // move to y = -100; dy = -100
        .realMouseMove(0, -100)

        // --- test

        // should scroll
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.be.above(0)
        })

      // should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Deactivation", () => {
    beforeEach(() => {
      // activation
      cy.get("#test-context").realClick({ button: "middle", position: "top" })

      // should have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      // deactivate
      cy.get("#test-context").realClick({ button: "left", position: "top" })

      // --- test
      cy.get("#test-context")
        .realMouseMove(0, -100)

        // should NOT scroll
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })

      // should NOT have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should deactivate with the activation combo", () => {
      // deactivate
      cy.get("#test-context").realClick({ button: "middle", position: "top" })

      // --- test
      cy.get("#test-context")
        .realMouseMove(0, -100)

        // should NOT scroll
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })

      // should NOT have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should deactivate when exited by user agent", () => {
      cy.document().then((document) => {
        // simulates exit by user agent, such as ESC press, window lose focus, etc.
        document.exitPointerLock()
      })

      // --- test
      cy.get("#test-context")
        .realMouseMove(0, -100)

        // should NOT scroll
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })

      // should NOT have PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })
  })
})

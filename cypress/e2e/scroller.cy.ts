import "cypress-real-events/support"

beforeEach(() => {
  cy.visit("/options/options.html")
})

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

describe("Browser Test for scroller", () => {
  context("Activation:mouse", () => {
    it("should activate & scroll with mouse moves", () => {
      cy.get("#test-context")
        .realClick({ button: "middle", position: "top" }) // y = 0
        .realMouseMove(0, -100) // move to y = -100; dy = -100
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.be.above(0)
        })
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Deactivation:mouse", () => {
    // activation
    beforeEach(() => {
      cy.get("#test-context").realClick({ button: "middle", position: "top" })
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should deactivate with a click", () => {
      cy.get("#test-context").realClick({ button: "left", position: "top" })

      // test
      cy.get("#test-context")
        .realMouseMove(0, -100)
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should deactivate with the activation combo", () => {
      cy.get("#test-context").realClick({ button: "middle", position: "top" })

      // test
      cy.get("#test-context")
        .realMouseMove(0, -100)
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })

    it("should deactivate when exited by user agent", () => {
      cy.document().then((document) => {
        // simulates exit by user agent, such as ESC press, window lose focus, etc.
        document.exitPointerLock()
      })

      // test
      cy.get("#test-context")
        .realMouseMove(0, -100)
        .then(($element) => {
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
        })
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.equal(null)
      })
    })
  })
})

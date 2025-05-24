import "cypress-real-events/support"

const PAGE_VERTICAL = "/test-pages/viewport-scroller?route=vertical"
const PAGE_HORIZONTAL = "/test-pages/viewport-scroller?route=horizontal"
const PAGE_BOTH = "/test-pages/viewport-scroller?route=both"

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

describe("Common pages with viewport scroller", () => {
  context("Vertical", () => {
    beforeEach(() => {
      cy.visit(PAGE_VERTICAL)
    })

    it("Baseline: shouldn't scroll if mouse is not moved", () => {
      // Activation
      cy.get("body")
        .realClick({
          button: "middle",
          position: "topLeft",
        })

        // Not actually moving
        .realMouseMove(0, 0)

        // Shouldn't scroll
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0) // Not Moved
          expect(left).to.equal(0) // Not Moved
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should scroll", () => {
      // Activation
      cy.get("body")
        .realClick({ button: "middle", position: "top" })

        // Scroll down & right
        .realMouseMove(-100, -100)

        // Should scroll down only
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(left).to.equal(0)
          expect(top).to.be.above(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Horizontal", () => {
    beforeEach(() => {
      cy.visit(PAGE_HORIZONTAL)
    })

    it("Baseline: shouldn't scroll if mouse move to same position", () => {
      // Activation
      cy.get("body")
        .realClick({
          button: "middle",
          position: "topLeft",
        })

        // Not actually moving
        .realMouseMove(0, 0, { shiftKey: true })

        // Should NOT scroll
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          expect(left).to.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should scroll horizontally but not vertically, with shift key", () => {
      // Activation
      cy.get("body")
        .realClick({
          button: "middle",
          position: "topLeft",
        })

        // Scroll right
        .realMouseMove(-100, 0, { shiftKey: true })

        // Should scroll right only
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(left).to.be.above(0)
          expect(top).to.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })

  context("Vertical & Horizontal", () => {
    beforeEach(() => {
      cy.visit(PAGE_BOTH)
    })

    it("Baseline: shouldn't scroll if mouse is not moved", () => {
      // Activation
      cy.get("body")
        .realClick({
          button: "middle",
          position: "topLeft",
        })

        // Not actually moving
        .realMouseMove(0, 0, { shiftKey: true })

        // Should NOT scroll
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(top).to.equal(0)
          expect(left).to.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("Baseline: should scroll vertically without shift key", () => {
      // Activation
      cy.get("body")
        .realClick({
          button: "middle",
          position: "topLeft",
        })

        // Scroll down without Shift key
        .realMouseMove(0, -100)

        // Should scroll down only
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(top).to.above(0)
          expect(left).to.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should NOT scroll horizontally WITHOUT shift key", () => {
      // Activationn
      cy.get("body")
        .realClick({ button: "middle", position: "top" })

        // Scroll right without Shift key
        .realMouseMove(-100, 0)

        // Should NOT scroll
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          expect(left).to.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })

    it("should scroll horizontally but not vertically, with shift key", () => {
      cy.get("body")
        // Activation
        .realClick({ button: "middle", position: "top" })

        // Scroll down & right with Shift key
        .realMouseMove(-100, -100, {
          shiftKey: true,
        })

        // Should scroll right only
        .then(($element) => {
          const left = $element.get(0).scrollLeft
          const top = $element.get(0).scrollTop
          expect(left).to.be.above(0)
          expect(top).to.be.equal(0)
        })

      // Should acquire PointerLock
      cy.document().should(($document) => {
        expect($document.pointerLockElement).to.not.equal(null)
      })
    })
  })
})

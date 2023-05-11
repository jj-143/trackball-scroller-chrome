import "cypress-real-events/support"

const TEST_PAGE = "regressions/disable-while-activated"

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

beforeEach(() => {
  cy.visit(TEST_PAGE)
})

context("when disabling scroller while being activated", () => {
  it("should NOT remain activated", () => {
    // "simulated disable" - for the lack of a way to do it currently.
    cy.getByCy("delayed-disable").first().click()

    // activate
    cy.get("#test-context").realClick({
      button: "middle",
      position: "top",
      scrollBehavior: false,
    })

    // PointerLock should be released by the "simulated disable"
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.be.equal(null)
    })

    const body = cy.get("#test-context")
    body
      // NOTE: realMouseMove & Scroller working weird
      // in this activated without PointerLock in Cypress
      // have to click and position "bottom" to trigger
      // upward mouse movement.
      .realClick({
        button: "left",
        position: "bottom",
        scrollBehavior: false,
      })

      // mouse move in -y direction
      .realMouseMove(0, -100, {
        position: "bottom",
        scrollBehavior: false,
      })

      // should NOT scroll
      .then(($element) => {
        const top = $element.get(0).scrollTop
        expect(top).to.not.be.above(0)
      })
  })
})

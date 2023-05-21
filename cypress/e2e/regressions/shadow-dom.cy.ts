import "cypress-real-events/support"

const TEST_PAGE = "regressions/shadow-dom"

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

context("when the content is inside a 'open' shadow root", () => {
  it("should activate", () => {
    cy.get("#container").then(($container) => {
      const content = $container[0].shadowRoot?.getElementById("content")

      cy.wrap(content).realClick({
        button: "middle",
        position: "top",
        scrollBehavior: false,
      })

      // -- test

      cy.document().should(($document) => {
        expect($document.pointerLockElement).not.to.be.equal(null)
      })
    })
  })
})

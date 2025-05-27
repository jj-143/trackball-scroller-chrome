import "cypress-real-events/support"
import { InMemoryStorage } from "../../src/store/providers"
import { createStorageData } from "../fixtures/storage"

let storage: InMemoryStorage

const PAGE = "/test-pages/modal-bs5"

beforeEach(() => {
  const isFocused = window.top?.document.hasFocus()
  assert(
    isFocused,
    "Browser should be focused in order to properly acquire a PointerLock."
  )
})

describe("Modal (Bootstrap 5), mouse", () => {
  beforeEach(() => {
    cy.visit(PAGE)
  })

  it("Baseline: Should scroll <body>", () => {
    // Activate on body
    cy.get("body")
      .realClick({
        button: "middle",
        position: "top",
      })

      // Scroll down
      .realMouseMove(0, -100)

      .then(($element) => {
        // Should scroll
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })

  it("should scroll modal body when long modal opened", () => {
    // Open modal
    cy.get("button[data-bs-target='#exampleModalLong']").click()
    cy.get("#exampleModalLong").should("not.have.attr", "aria-hidden")

    // Activate. Click on the 'backdrop' is allowed
    cy.get("body")
      .realClick({ button: "middle", position: "top" })
      // Scroll down
      .realMouseMove(0, -100)

    cy.get("#exampleModalLong").then(($element) => {
      // Should scroll
      const top = $element.get(0).scrollTop
      expect(top).to.be.above(0)
    })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })

  it("Should scroll modal's scroll element when scroll modal opened", () => {
    // Open modal
    cy.get("button[data-bs-target='#exampleModalScroll']").click()
    cy.get("#exampleModalScroll").should("not.have.attr", "aria-hidden")

    // Activate on modal body
    cy.get("#exampleModalScroll .modal-body")
      .realClick({ button: "middle", position: "top" })

      // Scroll down
      .realMouseMove(0, -100)
      .then(($element) => {
        // Should scroll
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })
})

describe("Modal (Bootstrap 5), keyboard", () => {
  // Provide scroller with keyboard activation
  beforeEach(() => {
    storage = new InMemoryStorage()

    new Cypress.Promise((resolve) => {
      storage
        .save(createStorageData({ type: "keyboard", button: "e" }))
        .then(resolve)
    })

    cy.visit(PAGE, {
      onBeforeLoad(window) {
        window._testStorage = storage
      },
    })
  })

  it("Baseline: Should scroll <body>", () => {
    // Focus for `cy.realPress()`
    const body = cy.get("body").realClick({
      button: "left",
      position: "top",
    })

    // Activate
    cy.realPress("e")

    // Scroll down
    body.realMouseMove(0, -100).then(($element) => {
      // Should scroll
      const top = $element.get(0).scrollTop
      expect(top).to.be.above(0)
    })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })

  /**
   * NOTE: Keyboard(auto target) specific behavior. Mouse can target anything.
   */
  it("should not scroll body when body's got hidden due to modal's opened", () => {
    // Open modal
    cy.get("button[data-bs-target='#exampleModal']").click()
    cy.get("#exampleModal").should("not.have.attr", "aria-hidden")

    // Activate
    cy.realPress("e")

    // Scroll down
    cy.get("body")
      .realMouseMove(0, -100)
      .then(($element) => {
        // Should NOT scroll
        const top = $element.get(0).scrollTop
        expect(top).to.equal(0)
      })

    cy.document().should("have.a.property", "pointerLockElement", null)
  })

  it("Should scroll modal body when long modal's opened", () => {
    // Open modal
    cy.get("button[data-bs-target='#exampleModalLong']").click()
    cy.get("#exampleModalLong").should("not.have.attr", "aria-hidden")

    // Activate
    cy.realPress("e")

    // Scroll down
    cy.get("body")
      .realMouseMove(0, 0) // Needs a reset
      .realMouseMove(0, -100)
      .then(($element) => {
        // Should NOT scroll
        const top = $element.get(0).scrollTop
        expect(top).to.equal(0)
      })

    // Scroll down
    cy.get("#exampleModalLong")
      .realMouseMove(0, 0) // Needs a reset
      .realMouseMove(0, -100)
      .then(($element) => {
        // Should scroll
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })

  it("should scroll scroll element in the modal", () => {
    // Open modal
    cy.get("button[data-bs-target='#exampleModalScroll']").click()
    cy.get("#exampleModalScroll").should("not.have.attr", "aria-hidden")

    // Activate
    cy.realPress("e")

    // Scroll down on body
    cy.get("body")
      .realMouseMove(0, 0)
      .realMouseMove(0, -100)

      .then(($element) => {
        // Should NOT scroll
        const top = $element.get(0).scrollTop
        expect(top).to.equal(0)
      })

    // Scroll down on modal body
    cy.get("#exampleModalScroll .modal-body")
      .realMouseMove(0, 0)
      .realMouseMove(0, -100)
      .then(($element) => {
        // Should scroll
        const top = $element.get(0).scrollTop
        expect(top).to.be.above(0)
      })

    // Should acquire PointerLock
    cy.document().should(($document) => {
      expect($document.pointerLockElement).to.not.equal(null)
    })
  })
})

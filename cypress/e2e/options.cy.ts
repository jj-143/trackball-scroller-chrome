import "cypress-real-events/support"
import { InMemoryStorage } from "../../src/store/providers"
import { createStorageData } from "../fixtures/storage"

let storage: InMemoryStorage

// activation button needs proper PointerLock to register activation combo
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

describe("UI and Store update", () => {
  context("Activation:Mouse", () => {
    beforeEach(async () => {
      await storage.save(createStorageData({ type: "keyboard", button: "e" }))
    })
    beforeEach(() => {
      cy.getByCy("activation").realClick().contains("hit combo")
    })

    it("should set to Mouse 1", () => {
      cy.getByCy("activation")
        .realClick({ button: "left" })
        .should("contain.text", "Mouse 1")
        .then(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.button).to.equal(0)
          expect(storeActivation?.type).to.equal("mouse")
        })
    })
    it("should set to Mouse 2", () => {
      cy.getByCy("activation")
        .realClick({ button: "middle" })
        .should("contain.text", "Mouse 2")
        .then(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.button).to.equal(1)
          expect(storeActivation?.type).to.equal("mouse")
        })
    })
    it("should set to Mouse 3", () => {
      cy.getByCy("activation")
        .realClick({ button: "right" })
        .should("contain.text", "Mouse 3")
        .then(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.button).to.equal(2)
          expect(storeActivation?.type).to.equal("mouse")
        })
    })
  })
  context("Activation:Keyboard", () => {
    beforeEach(async () => {
      await storage.save(createStorageData({ type: "mouse", button: 1 }))
    })
    beforeEach(() => {
      cy.getByCy("activation").realClick().contains("hit combo")
    })

    it("should set to 'e' Key", () => {
      cy.realPress("e")
      cy.getByCy("activation")
        .should("contain.text", "E")
        .then(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.button).to.equal("e")
          expect(storeActivation?.type).to.equal("keyboard")
        })
    })
  })

  context("NonActivation Modifier", () => {
    beforeEach(async () => {
      await storage.save(createStorageData({ type: "mouse", button: 1 }))
    })

    it("should set 1 modifier", () => {
      cy.getByCy("mod-ctrl")
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")

        // --- test
        .click()
        .should("not.have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.nonActivation.ctrl).to.equal(true)
        })
    })
    it("should set 2 modifiers", () => {
      cy.getByCy("mod-ctrl")
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
        .click()
      cy.getByCy("mod-alt")
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
        .click()

      cy.getByCy("mod-ctrl")
        .should("not.have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.nonActivation.ctrl).to.equal(true)
        })
      cy.getByCy("mod-alt")
        .should("not.have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const storeActivation = storage.store?.userOption.scroller.activation
          expect(storeActivation?.nonActivation.ctrl).to.equal(true)
        })
    })
  })

  context("Sensitivity", () => {
    it("should decrease", () => {
      cy.then(() =>
        storage.save(
          createStorageData({ type: "mouse", button: 1, sensitivity: 2 })
        )
      )
      cy.getByCy("sensitivity-value")
        .should("have.text", "2")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(2)
        })
      cy.getByCy("sensitivity-decrease").click()
      cy.getByCy("sensitivity-value")
        .should("have.text", "1")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(1)
        })
    })
    it("should increase", () => {
      cy.then(() =>
        storage.save(
          createStorageData({ type: "mouse", button: 1, sensitivity: 2 })
        )
      )
      cy.getByCy("sensitivity-value")
        .should("have.text", "2")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(2)
        })
      cy.getByCy("sensitivity-increase").click()
      cy.getByCy("sensitivity-value")
        .should("have.text", "3")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(3)
        })
    })
    it("should NOT go under 1", () => {
      cy.then(() =>
        storage.save(
          createStorageData({ type: "mouse", button: 1, sensitivity: 1 })
        )
      )
      cy.getByCy("sensitivity-value")
        .should("have.text", "1")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(1)
        })
      cy.getByCy("sensitivity-decrease").click()
      cy.getByCy("sensitivity-value")
        .should("have.text", "1")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(1)
        })
    })
    it("should NOT go over 20", () => {
      cy.then(() =>
        storage.save(
          createStorageData({ type: "mouse", button: 1, sensitivity: 20 })
        )
      )
      cy.getByCy("sensitivity-value")
        .should("have.text", "20")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(20)
        })
      cy.getByCy("sensitivity-increase").click()
      cy.getByCy("sensitivity-value")
        .should("have.text", "20")
        .should(() => {
          expect(storage.store?.userOption.scroller.sensitivity).to.equal(20)
        })
    })
  })

  context("Natural Scrolling", () => {
    it("should toggle from false to true", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 1,
            naturalScrolling: false,
          })
        )
      )
      cy.getByCy("natural-scrolling")
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const scroller = storage.store?.userOption.scroller
          expect(scroller?.naturalScrolling).to.equal(false)
        })
        .click()
        .should("not.have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const scroller = storage.store?.userOption.scroller
          expect(scroller?.naturalScrolling).to.equal(true)
        })
    })
    it("should toggle from true to false", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 1,
            naturalScrolling: true,
          })
        )
      )
      cy.getByCy("natural-scrolling")
        .should("not.have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const scroller = storage.store?.userOption.scroller
          expect(scroller?.naturalScrolling).to.equal(true)
        })
        .click()
        .should("have.css", "background-color", "rgba(0, 0, 0, 0)")
        .should(() => {
          const scroller = storage.store?.userOption.scroller
          expect(scroller?.naturalScrolling).to.equal(false)
        })
    })
  })
})

describe("Mouse3 Warning", () => {
  context("when activation without Mouse 3", () => {
    it("should NOT show", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 0,
          })
        )
      )
      cy.getByCy("warning-mouse3").should("not.be.visible")
    })
  })

  context("when activation with Mouse 3", () => {
    it("should show warning", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 2,
          })
        )
      )
      cy.getByCy("warning-mouse3").should("be.visible")
    })

    it("should NOT show warning with activation modifier", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 2,
            modsActivation: {
              ctrl: true,
            },
          })
        )
      )
      cy.getByCy("warning-mouse3").should("not.be.visible")
    })

    it("should NOT show warning with non-activation modifier", () => {
      cy.then(() =>
        storage.save(
          createStorageData({
            type: "mouse",
            button: 2,
            modsNonActivation: {
              ctrl: true,
            },
          })
        )
      )
      cy.getByCy("warning-mouse3").should("not.be.visible")
    })
  })
})

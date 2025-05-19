it("Screenshots", () => {
  cy.viewport("macbook-13")
  cy.visit("/options/options.html")
  cy.screenshot({ capture: "fullPage" })
})

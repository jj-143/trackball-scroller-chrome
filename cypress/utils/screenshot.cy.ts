it("Options page screenshot (1440x900)", () => {
  cy.viewport(1440, 900)
  cy.visit("/options/options.html")
  cy.screenshot({ capture: "fullPage", overwrite: true })
})

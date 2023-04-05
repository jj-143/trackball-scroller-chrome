// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    getByCy(value: string): Chainable<JQuery<Element>>
  }
}

Cypress.Commands.add(
  "getByCy",
  {
    prevSubject: "optional",
  },
  (subject, selector) => {
    return cy.get(`[data-cy="${selector}"]`, {
      withinSubject: subject as HTMLElement,
    })
  }
)

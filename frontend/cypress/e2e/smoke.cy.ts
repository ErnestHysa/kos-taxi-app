describe('Kos Taxi smoke journey', () => {
  it('navigates from the landing page to the ride booking form', () => {
    cy.visit('/')

    cy.contains('Kos Taxi').should('be.visible')
    cy.contains('Book a Ride').click()

    cy.location('pathname').should('include', '/ride')
    cy.contains(/schedule your ride/i).should('be.visible')
  })
})

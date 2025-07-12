describe('bourgad-front-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display feed view', () => {
    // Custom command example, see `../support/commands.ts` file
    // cy.login('my-email@something.com', 'myPassword');
    cy.get('input[name="name"]').should('have.attr', 'placeholder', 'Kevin, que souhaitez-vous partager dans votre Bourgade ?');
    // Function helper example, see `../support/app.po.ts` file
  });
});

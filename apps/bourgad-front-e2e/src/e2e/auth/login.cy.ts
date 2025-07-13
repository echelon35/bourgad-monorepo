import * as user from '../../fixtures/user.json';

describe('Login', () => {
  it('should login an existing user', () => {
    cy.login(user.existingUser);
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
});

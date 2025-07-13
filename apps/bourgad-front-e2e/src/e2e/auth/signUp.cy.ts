import * as user from '../../fixtures/user.json';

describe('Sign Up', () => {
  it('should sign up a new user', () => {
    cy.signUp(user.newUser);
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });
});

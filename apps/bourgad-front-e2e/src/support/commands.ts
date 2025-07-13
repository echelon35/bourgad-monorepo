/* eslint-disable @typescript-eslint/no-namespace */
import { SignUpDto, LoginDto } from '@bourgad-monorepo/internal';

declare global {
  namespace Cypress {
    interface Chainable<> {
      signUp(user: SignUpDto): Chainable<Element>;
      login(user: LoginDto): Chainable<Element>;
      googleLogin(user: LoginDto): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('signUp', (user: SignUpDto) => {
  cy.visit('/signup');
  cy.get('[data-cy=firstname]').type(user.firstname);
  cy.get('[data-cy=lastname]').type(user.lastname);
  cy.get('[data-cy=mail]').type(user.mail);
  cy.get('[data-cy=password]').type(user.password);
  cy.get('[data-cy=submit]').click();
});

Cypress.Commands.add('login', (user: LoginDto) => {
  cy.visit('/login');
  cy.get('[data-cy=mail]').type(user.mail);
  cy.get('[data-cy=password]').type(user.password);
  cy.get('[data-cy=submit]').click();
});

Cypress.Commands.add('googleLogin', () => {
  cy.log('Logging in to Google')
  cy.request({
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    body: {
      grant_type: 'refresh_token',
      client_id: Cypress.env('googleClientId'),
      client_secret: Cypress.env('googleClientSecret'),
      refresh_token: Cypress.env('googleRefreshToken'),
    },
  }).then(({ body }) => {
    const { access_token, id_token } = body

    cy.request({
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      headers: { Authorization: `Bearer ${access_token}` },
    }).then(({ body }) => {
      cy.log(body)
      const userItem = {
        token: id_token,
        user: {
          googleId: body.sub,
          email: body.email,
          givenName: body.given_name,
          familyName: body.family_name,
          imageUrl: body.picture,
        },
      }

      window.localStorage.setItem('googleCypress', JSON.stringify(userItem))
      cy.visit('/')
    })
  })
})
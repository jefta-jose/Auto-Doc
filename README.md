# Summit-Tests

Repo for all tests for **Summit**

## **Skipping Tests on Specific Environments**

We use the [`cypress-skip-tests`] plugin to **conditionally skip or run Cypress tests depending on the environment**.

This helps us avoid running tests that are irrelevant (or unsafe) in certain environments, such as **staging**, **dev**, or **production**. For example:
- Avoiding failures in environments where certain features are not yet available.
- Skipping unstable or under-development features in dev.
- Running validations only in production.

## **Setup**

Install dependencies:

```bash
npm i
```
## **Example usage in spec file :**

```javascript
import 'cypress-skip-tests/support';

// Example: skip test if running on staging
skipOn('staging', 'should not run on staging', () => {
  it('runs only on non-staging envs', () => {
    cy.visit('/');
  });
});

skipOn('dev', () => {
  describe('Critical tests', () => {
    it('should run only outside dev', () => {
      cy.visit('/');
    });
  });
});

// Example: run this test only on production
onlyOn('production', 'should verify production banner', () => {
  it('checks prod-only feature', () => {
    cy.contains('Welcome to Production');
  });
});

```
## **Running Tests on a Specific Environment**

```bash
npx cypress open --env "ROLE=adminCreds,ENV=development"
```

## **Slowing Down Tests**

To run tests slower:
```bash
npx cypress open --env "ROLE=adminCreds, COMMAND_DELAY=7000"




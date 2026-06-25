# Mock CBS Account Automation

A Cypress-based automation project for creating user accounts in the mock CBS web application.

## Features

- End-to-end test coverage for account creation flows
- Uses Cypress for browser automation
- Supports headless execution and interactive test running
- Includes `cypress-xpath` for XPath-based selectors

## Prerequisites

- Node.js 16+ installed
- npm available in your environment
- Mock CBS web app running locally or accessible via configured base URL

## Installation

```bash
cd "Create User Automation"
npm install
```

## Available scripts

- `npm run cypress:open` — open Cypress Test Runner
- `npm run cypress:run` — execute tests in headless mode
- `npm run cypress:open:prompt` — custom script wrapper for Cypress via `scripts/run-cypress.js`

## Running tests

### Open Cypress interactively

```bash
npm run cypress:open
```

### Run tests in headless mode

```bash
npm run cypress:run
```

### Custom prompt mode

```bash
npm run cypress:open:prompt
```

## Configuration

The project uses `cypress.config.js` for Cypress settings. By default, tests expect the application to be available at `http://localhost:3000`.

If your target app runs on a different URL, update the `baseUrl` value in `cypress.config.js`.

## Notes

- The tests rely on XPath selectors via the `cypress-xpath` plugin.
- If the page structure or timing changes, update selectors and wait logic in `cypress/e2e/*.cy.js`.
- Ensure any required test fixtures are present in `cypress/fixtures`.

## Project structure

- `cypress/e2e/` — Cypress test specs
- `cypress/fixtures/` — static test data
- `cypress/support/` — custom Cypress commands and support files
- `scripts/run-cypress.js` — custom Cypress runner script

## Dependencies

- `cypress` — browser automation framework
- `cypress-xpath` — XPath support for Cypress

## Tips

- Use `npx cypress open --env groupsCount=5,groups619=2` to supply environment variables for test runs.
- Keep selectors stable by preferring data attributes when possible.
- Review the Cypress Test Runner output for any failing assertions or timeout issues.

# Mock CBS Account Automation

This repo scaffolds a Cypress test to automate account creation on the mock CBS web app using the XPaths you provided.

Quick start:

1. Install dependencies:

```bash
cd "Create User Automation"
npm install
```

2. Open Cypress interactive app:

```bash
npx cypress open
```

3. Run tests headless:

```bash
npm run cypress:run

### npx cypress open --env groupsCount=5,groups619=2
### npm run cypress:open:prompt
```

Notes:
- The tests assume the app runs at `http://localhost:3000`. Update `cypress.config.js` `baseUrl` if different.
- Tests use XPath selectors (`cypress-xpath`).
- Adjust waits and selectors if the page structure or timing differs.

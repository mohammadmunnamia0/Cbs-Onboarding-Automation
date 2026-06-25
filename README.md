# 🎯 Mock CBS Account Automation

A polished Cypress automation suite for creating user accounts in the mock CBS web application.

---

## ✨ What this project does

- Automates account creation flows in the mock CBS UI
- Uses Cypress for reliable browser automation
- Supports both interactive and headless execution
- Leverages `cypress-xpath` for XPath-driven selectors

## 🚀 Quick start

```bash
cd "Create User Automation"
npm install
```

## ⚙️ Available commands

| Command | Description |
| --- | --- |
| `npm run cypress:open` | Launch Cypress Test Runner |
| `npm run cypress:run` | Run tests headless |
| `npm run cypress:open:prompt` | Run custom Cypress prompt script |

## 🧪 Run tests

### Interactive mode

```bash
npm run cypress:open
```

### Headless mode

```bash
npm run cypress:run
```

### Custom prompt mode

```bash
npm run cypress:open:prompt
```

## 🔧 Configuration

The active Cypress settings are stored in `cypress.config.js`.

- Default `baseUrl`: `http://localhost:3000`
- If your app runs elsewhere, update `baseUrl` accordingly.

## 📁 Project structure

- `cypress/e2e/` — test specs
- `cypress/fixtures/` — test data and mocks
- `cypress/support/` — custom commands and support utilities
- `scripts/run-cypress.js` — custom launcher for Cypress

## 📝 Notes

- Tests use XPath selectors via `cypress-xpath`
- If page structure or timing changes, update selectors and waits in `cypress/e2e/*.cy.js`
- Keep fixture data current in `cypress/fixtures`

## 📦 Dependencies

- `cypress` — browser automation framework
- `cypress-xpath` — XPath selector support

## 💡 Tips

- Use environment variables to control run parameters:
  - `npx cypress open --env groupsCount=5,groups619=2`
- Prefer stable selectors such as `data-*` attributes when updating tests
- Check Cypress logs for timeouts or selector failures

---

## 🛠️ Recommended workflow

1. Install dependencies
2. Start your mock CBS app
3. Run `npm run cypress:open` to debug interactively
4. Use `npm run cypress:run` for CI-friendly test execution

# 🎯 Mock CBS Account & Limit Automation

Cypress automation for the OptiFin staging environment. It:

1. Creates customer accounts (CD, OD, ASG) in the mock CBS
2. Saves the created accounts so they can be reused
3. Creates and approves a **Limit** for a saved account (currently **Factoring Finance – FF**)

```
Create Accounts → Save Account Details → Create Limit? → Select Account → Select Module → Create Limit
```

---

## 🚀 Quick start

```bash
cd "Create User Automation"
npm install
npm run cypress:open:prompt
```

## ⚙️ Available commands

| Command | Description |
| --- | --- |
| `npm run cypress:open:prompt` | Create accounts (asks for 617 / 619 counts), then optionally create Limits for them |
| `npm run limit:prompt` | Create a Limit for a saved account (or one typed in) |
| `npm run limit:run` | Run the FF Limit spec with the values in `limitData` (no prompt) |
| `npm run cypress:open` | Open the Cypress window and pick a spec |
| `npm run cypress:run` | Run **every** spec headless (see the warning below) |

> ⚠️ `npm run cypress:run` also runs `create_limit_ff.cy.js` with its default loan account, which already has a limit, so that spec fails with `CUSTOMER ALREADY ONBOARDED`. Use the prompts instead.

---

## 👤 Create accounts

```bash
npm run cypress:open:prompt
```

It asks:

| Question | Default |
| --- | --- |
| How many **617-type** accounts? | `1` |
| How many **619-type** accounts? | `0` |
| Create **Limits** for these accounts after they are created? (yes/no) | `no` |

Each account is **one customer** with three CBS accounts: **CD**, **OD** and **ASG**, all with the same customer ID and company name. 617 / 619 is the `loanLimitProd` value the account is created with.

### If you answer **No**

The Cypress window opens as before. Click `create_accounts.cy.js`. The accounts are created and saved; no Limit is created. You can create a Limit for them later with `npm run limit:prompt`.

### If you answer **Yes**

The accounts are created straight away in a visible browser that closes by itself. Then the terminal asks:

1. **Which account do you want to create the Limit for?** Pick from the accounts just created: a number (`1`), several (`1,3`) or `all`.
2. **Which module should the Limit be created in?** `DF`, `FF`, `RF`, `WOF`, `HRF` or `EFA`.

Then it creates and approves the Limit for each chosen account, one after the other.

```
Accounts:
  1) NIRJHOR TEXTILE MILLS LTD. | 617 | CD 48213... | OD 90127... | ASG 33810...
  2) SABUJ DAIRY PLC | 619 | CD 12093... | OD 55821... | ASG 77410...
Which account do you want to create the Limit for? (number, e.g. 1 or 1,3, or all) (1): 2

Modules: FF, DF (not automated yet), RF (not automated yet), WOF (not automated yet), HRF (not automated yet), EFA (not automated yet)
Which module should the Limit be created in? (FF): FF
```

> Only **FF** has a Limit automation so far. The other modules are listed but marked *not automated yet*.

### Company names

Customer names are standalone companies in **CAPITAL LETTERS** ending in `LTD.`, `LIMITED` or `PLC` (e.g. `NIRJHOR TEXTILE MILLS LTD.`). Group, holding or umbrella names and brands of known Bangladeshi conglomerates/banks are rejected. The rules live in `cypress/support/companyNames.js`.

Regenerate the company name fixture with:

```bash
node scripts/generate_company_names.js > cypress/fixtures/company_names_5000.txt
```

---

## 💾 Saved accounts

Every customer whose CD, OD and ASG accounts are all submitted is added to:

```
cypress/fixtures/created_accounts.json
```

```json
{
  "runId": "2026-10-08T10:15:00.000Z",
  "createdAt": "2026-10-08T10:15:42.000Z",
  "loanLimit": "617",
  "customerId": "48213907",
  "customerName": "NIRJHOR TEXTILE MILLS LTD.",
  "cdAccount": "48213907561",
  "odAccount": "90127734410",
  "asgAccount": "33810275519",
  "limits": {
    "FF": { "status": "approved", "updatedAt": "2026-10-08T10:21:03.000Z" }
  }
}
```

- `limits` records each Limit created for the customer: `submitted` after the Maker submits, `approved` after the Authorizer approves.
- The prompts skip an account that already has a Limit in the chosen module.
- The file only grows. Delete entries (or the whole file) when you no longer need them.
- An account is saved once all three forms are submitted. The spec does not check that the CBS accepted them.

---

## 🏦 Create a Limit – Factoring Finance (FF)

```bash
npm run limit:prompt
```

It asks:

1. Use a **saved** account or enter one **manually**
2. **Which account** (from the saved list)
3. **Which module** (only FF for now)
4. How many **buyers** to add (number or `all`, default `2`)
5. **Mode**: `run` (browser visible, finishes by itself) or `open` (Cypress window)

### What the FF spec does

`cypress/e2e/create_limit_ff.cy.js`:

1. **Maker** (`cad_duo`) logs in → Factoring Finance → Limit → Create Limit
   - **Customer Information:** Loan Account → Tick Mark (customer details load from CBS) → Contact Number, Assignment Account, Business Nature and rates
   - **Anchor Information:** for each buyer, click **New Anchor**, type letters into **Anchor Name** and take the first suggestion not used yet. Anchors with no Remaining Notional Limit, and anchors in `excludedAnchors` (in `limitData`), are skipped. No anchor names are fixed.
   - Submit
2. **Authorizer** (`cad03_auth`) logs in → Factoring Finance → Limit → searches the customer name → ticks **only that row** → Approve

### Which accounts are used

| Limit field | Saved account field |
| --- | --- |
| Loan Account | `odAccount` |
| Assignment Account | `asgAccount` |
| Customer name (approval search) | `customerName` |

The mapping is in `scripts/limitModules.js`.

### Rules

A limit can be created **only once per loan account**. With a used account the run stops with `CUSTOMER ALREADY ONBOARDED`.

The spec checks these before it starts, so a bad value fails right away:

- Penalty, Interest, Invoice Processing and Safety Deposit rates ≤ 20
- Customer and buyer financing rates ≤ 100
- Customer financing rate ≥ buyer financing rate
- Grace Period (≤ 100) and Credit Period are whole numbers

The anchor limit (default `1,000,000`) is lowered to the anchor's Remaining Notional Limit when that is smaller.

### Changing values

Rates, buyer limit / credit period / financing rate, users and the login URL are in `limitData` at the top of `create_limit_ff.cy.js`.

You can also pass values directly. Use JSON so account numbers stay as text (leading zeros are kept):

```bash
npx cypress run --spec cypress/e2e/create_limit_ff.cy.js \
  --env '{"loanAccount":"42193970119","assignmentAccount":"43193970119","customerName":"D19 Autos","buyerCount":"2"}'
```

Other env values: `makerUserID`, `makerPassword`, `authUserID`, `authPassword`, `loginUrl`, `contactNumber`.

### Adding another module (DF, RF, WOF, HRF, EFA)

1. Write its spec in `cypress/e2e/` (use `create_limit_ff.cy.js` as the template)
2. In `scripts/limitModules.js`, set that module's `spec` and an `env` function that maps a saved account to the spec's values
3. Call `cy.task('markLimit', { accountNo, module, status })` in the spec so the saved account records the limit

The prompts pick it up automatically.

---

## 🔧 Configuration

`cypress.config.js`:

- `baseUrl`: `https://staging.optifin.sscl.tech/cbs-service/accounts` (mock CBS, used by account creation)
- The Limit spec logs in at `https://staging.optifin.sscl.tech/login` (`loginUrl` in `limitData`)
- Tasks `saveCreatedAccount` and `markLimit` write to `cypress/fixtures/created_accounts.json`
- Videos and failure screenshots are turned off (`video`, `screenshotOnRunFailure`). Set them to `true` when you need them for debugging.

Environment values for account creation:

```bash
npx cypress open --env count617=3,count619=2
```

The older `groupsCount=5,groups619=2` (last N groups are 619) still works.

## 📁 Project structure

| Path | Purpose |
| --- | --- |
| `cypress/e2e/create_accounts.cy.js` | Creates CD, OD, ASG accounts per customer and saves them |
| `cypress/e2e/create_limit_ff.cy.js` | Creates and approves an FF Limit |
| `cypress/fixtures/created_accounts.json` | Saved accounts (created on the first run) |
| `cypress/fixtures/company_names_5000.txt` | Company name dataset |
| `cypress/support/companyNames.js` | Company name rules and generator |
| `scripts/run-cypress.js` | Account creation prompt (and optional Limit creation) |
| `scripts/run-limit.js` | Limit creation prompt |
| `scripts/limitPrompt.js` | Shared account / module questions |
| `scripts/limitModules.js` | Limit modules and which spec creates each |
| `scripts/accountStore.js` | Reads and writes saved accounts |
| `scripts/generate_company_names.js` | Regenerates the company name dataset |

## 📦 Dependencies

- `cypress` — browser automation framework
- `cypress-xpath` — XPath selector support

## 🩺 Troubleshooting

| Problem | Fix |
| --- | --- |
| `CUSTOMER ALREADY ONBOARDED` | That loan account already has a limit. Pick another account. |
| `No anchor with remaining notional limit was found` | No anchor in the Anchor Name search has limit left. Check the anchors in the app. |
| Cypress prints `bad option: --no-sandbox` | The terminal has `ELECTRON_RUN_AS_NODE` set (VS Code can do this). The prompts remove it; for plain `npx cypress` commands run `unset ELECTRON_RUN_AS_NODE` first. |
| `... a popup is still open: "..."` | The app kept a popup open (for example, it refused an anchor). The quoted text is the popup's message. If an anchor causes it, add the anchor to `excludedAnchors`. |
| A button or field is not found | The page changed. Update the XPath in the `selectors` object at the top of the spec. |

## 🛠️ Recommended workflow

1. `npm install`
2. `npm run cypress:open:prompt` → create accounts, answer **Yes** to create a Limit now or **No** to do it later
3. Later: `npm run limit:prompt` → pick a saved account → pick a module
4. Check `cypress/fixtures/created_accounts.json` to see which accounts have limits

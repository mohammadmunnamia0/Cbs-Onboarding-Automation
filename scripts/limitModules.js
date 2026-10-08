// Modules a limit can be created in. `spec` is null until that module's
// limit automation exists; the prompts list it but will not run it.
//
// `env` maps a saved account (see accountStore.js) to the spec's Cypress env.

const LIMIT_MODULES = [
  {
    code: 'FF',
    name: 'Factoring Finance',
    spec: 'cypress/e2e/create_limit_ff.cy.js',
    env: acc => ({ loanAccount: acc.odAccount, assignmentAccount: acc.asgAccount, customerName: acc.customerName })
  },
  { code: 'DF', spec: null },
  { code: 'RF', spec: null },
  { code: 'WOF', spec: null },
  { code: 'HRF', spec: null },
  { code: 'EFA', spec: null }
]

module.exports = LIMIT_MODULES

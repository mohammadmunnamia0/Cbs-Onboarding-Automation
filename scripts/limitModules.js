// Modules a limit can be created in. `spec` is null until that module's
// limit automation exists; the prompts list it but will not run it.
//
// `env` maps a saved account (see accountStore.js) to the spec's Cypress env.
// `financingRate` is passed to the spec as env `financingRate` and used for
// both the customer and the anchor financing rate.

const LIMIT_MODULES = [
  {
    code: 'FF',
    name: 'Factoring Finance',
    spec: 'cypress/e2e/create_limit_ff.cy.js',
    financingRate: '80',
    env: acc => ({ loanAccount: acc.odAccount, assignmentAccount: acc.asgAccount, customerName: acc.customerName })
  },
  { code: 'DF', spec: null, financingRate: '100' },
  { code: 'RF', spec: null, financingRate: '100' },
  { code: 'WOF', spec: null, financingRate: '100' },
  { code: 'HRF', spec: null, financingRate: '100' },
  { code: 'EFA', spec: null, financingRate: '100' }
]

module.exports = LIMIT_MODULES

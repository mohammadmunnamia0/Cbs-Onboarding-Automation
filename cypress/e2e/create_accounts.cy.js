/// <reference types="cypress" />

// Dynamic data generation: produces groups of 3 accounts each (CD, OD, ASG)
// Each group is one customer and is either a 617 or a 619 group (loanLimitProd).
// Set the counts with Cypress env `count617` / `count619` (what the prompt
// passes), or the older `groupsCount` + `groups619` (last N groups are 619).
//
// Every group that is created is saved to cypress/fixtures/created_accounts.json
// (see scripts/accountStore.js) so the limit automation can reuse it.

function envCount(name){
  try {
    if (typeof Cypress !== 'undefined' && Cypress.env && Cypress.env(name) !== undefined) {
      const v = Number(Cypress.env(name))
      if (Number.isInteger(v) && v >= 0) return v
    }
  } catch (e) {}
  return null
}

const count617 = envCount('count617')
const count619 = envCount('count619')
const useTypeCounts = count617 !== null || count619 !== null

// Ties saved accounts to this run, so the prompt can offer only the new ones
const runId = (() => {
  try {
    if (typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('runId')) return String(Cypress.env('runId'))
  } catch (e) {}
  return new Date().toISOString()
})()

const groupsCount = useTypeCounts ? (count617 || 0) + (count619 || 0) : (() => {
  try {
    if (typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('groupsCount') !== undefined) {
      const v = Number(Cypress.env('groupsCount'))
      if (Number.isInteger(v) && v > 0) return v
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GROUPS_COUNT) {
      const v = Number(process.env.GROUPS_COUNT)
      if (Number.isInteger(v) && v > 0) return v
    }
  } catch (e) {}
  return 1
})()

// How many groups (not accounts) should use loanLimit 619. The last N groups
// will use loanLimit 619; the rest will use 617. Can be set via Cypress env
// `groups619` or process env `GROUPS_619`.

const groupsWith619 = useTypeCounts ? (count619 || 0) : (() => {
  try {
    if (typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('groups619') !== undefined) {
      const v = Number(Cypress.env('groups619'))
      if (Number.isInteger(v) && v >= 0) return Math.min(v, groupsCount)
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GROUPS_619) {
      const v = Number(process.env.GROUPS_619)
      if (Number.isInteger(v) && v >= 0) return Math.min(v, groupsCount)
    }
  } catch (e) {}
  return 0
})()

function randNumeric(len){
  let s = ''
  for(let i=0;i<len;i++) s += Math.floor(Math.random()*10)
  return s
}

// Standalone company names in CAPITAL LETTERS ending in LTD. / LIMITED / PLC.
// Rules are shared with scripts/generate_company_names.js.
const { randomCompanyName, isValidCompanyName } = require('../support/companyNames')

function randCompanyName(){
  const name = randomCompanyName()
  if (!isValidCompanyName(name)) throw new Error(`Invalid company name generated: ${name}`)
  return name
}


// Build groups: each group has one customerId, a cdAccount (used for all three), and three unique accountNos
const accounts = Array.from({length: groupsCount}, (_, i) => {
  const cdAccount = randNumeric(11)
  return {
    accountNos: [cdAccount, randNumeric(11), randNumeric(11)],
    customerId: randNumeric(8),
    cdAccount // CD account number (first account)
  }
})

// Random company name generator
function randName(){
  return randCompanyName()
}

// CSS Selectors from user
const selectors = {
  addAccountButton: 'body > div.container > div.filters-section > div.filter-actions > button:nth-child(3)',
  accountNo: '#od_account_no',
  customerId: '#customer_id',
  cdAccount: '#cd_account',
  totalCreditLimit: '#total_credit_limit',
  loanLimitProd: '#loan_limit_prod',
  customerName: '#customer_name',
  branchId: '#branch_id',
  customerAddress: '#customer_address',
  rmId: '#rm_id',
  limitExpiryDate: '#limit_expiry_date',
  sectorCode: '#sector_code',
  customerSegment: '#customer_segment',
  accountType: '#acc_type',
  submitButton: '#addAccountForm > button'
}

describe('Mock CBS - Bulk account creation', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000) // wait for page load
  })

  accounts.forEach((entry, cdIdx) => {

    // Decide whether this group should use loanLimit 619. We take the last
    // `groupsWith619` groups and mark them as 619; others use 617.

    const is619Group = groupsWith619 > 0 && cdIdx >= (groupsCount - groupsWith619)
    const loanLimit = is619Group ? '619' : '617'

    it(`creates CD, OD, ASG accounts for customer ${entry.customerId} (CD ${entry.cdAccount})`, () => {
      const companyName = randName()

      // Helper to fill common fields and submit
      const createAccount = (accNo, custId, cdAcc, type, finalName) => {
        cy.log(`Creating ${type} account ${accNo}`)
        cy.get(selectors.addAccountButton).should('be.visible').click()
        cy.wait(400)

        cy.get(selectors.accountNo).clear().type(accNo)
        cy.get(selectors.customerId).clear().type(custId)
        cy.get(selectors.cdAccount).clear().type(cdAcc)
        cy.get(selectors.totalCreditLimit).clear().type('50000000')
        cy.get(selectors.loanLimitProd).clear().type(loanLimit)
        cy.get(selectors.customerName).clear().type(finalName)

        cy.get(selectors.branchId).then($sel => {
          const opts = $sel.find('option')
          if(opts.length > 1) {
            const idxOpt = Math.floor(Math.random()*(opts.length-1))+1
            const val = opts.eq(idxOpt).val()
            if(val !== undefined) cy.wrap($sel).select(val)
          }
        })

        cy.get(selectors.customerAddress).clear().type('Dhanmondi')

        cy.get(selectors.rmId).then($sel => {
          const opts = $sel.find('option')
          if(opts.length > 1) {
            const idxOpt = Math.floor(Math.random()*(opts.length-1))+1
            const val = opts.eq(idxOpt).val()
            if(val !== undefined) cy.wrap($sel).select(val)
          }
        })

        cy.get(selectors.limitExpiryDate).clear().type('2035-08-31')
        cy.get(selectors.sectorCode).clear().type('902134')
        cy.get(selectors.customerSegment).clear().type('MSE-MEDIUM')

        cy.get(selectors.accountType).then($sel => {
          const opts = $sel.find('option')
          let foundVal = null
          opts.each((i, o) => {
            const txt = Cypress.$(o).text().trim().toUpperCase()
            if(txt.includes(type)) foundVal = Cypress.$(o).val()
          })
          if(foundVal) cy.wrap($sel).select(foundVal)
          else if(opts.length>1) cy.wrap($sel).select(opts.eq(1).val())
        })

        cy.get(selectors.submitButton).should('be.visible').click()
        cy.wait(800)
      }

      // Create CD first and use its account number as cdAccount for others

      const cdAccNo = entry.accountNos[0]
      const custId = entry.customerId
      const createdName = companyName
      createAccount(cdAccNo, custId, cdAccNo, 'CD', createdName)

      // Create OD
      const odAccNo = entry.accountNos[1]
      createAccount(odAccNo, custId, cdAccNo, 'OD', createdName)

      // Create ASG
      const asgAccNo = entry.accountNos[2]
      createAccount(asgAccNo, custId, cdAccNo, 'ASG', createdName)

      // Save only after all three were submitted, for the limit automation
      cy.task('saveCreatedAccount', {
        runId,
        createdAt: new Date().toISOString(),
        loanLimit,
        customerId: custId,
        customerName: createdName,
        cdAccount: cdAccNo,
        odAccount: odAccNo,
        asgAccount: asgAccNo
      })
    })
  })
})

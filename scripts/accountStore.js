// Saved accounts from create_accounts.cy.js, reused by the limit automation.
//
// Used from Node only: cypress.config.js tasks write to it while specs run,
// and the prompt scripts read it to offer accounts for limit creation.
//
// Each entry: { runId, createdAt, loanLimit: '617' | '619', customerId, customerName,
//               cdAccount, odAccount, asgAccount, limits: { FF: { status, updatedAt } } }

const fs = require('fs')
const path = require('path')

const STORE_FILE = path.join(__dirname, '..', 'cypress', 'fixtures', 'created_accounts.json')

function load(){
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'))
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw new Error(`Cannot read ${STORE_FILE}: ${e.message}`)
  }
}

function save(accounts){
  fs.writeFileSync(STORE_FILE, JSON.stringify(accounts, null, 2) + '\n')
}

function add(record){
  const accounts = load()
  accounts.push({ ...record, limits: {} })
  save(accounts)
}

// Records a limit against whichever saved customer owns `accountNo`.
// Returns false when the account was not created by this project.
function markLimit(accountNo, module, status){
  const accounts = load()
  const acc = accounts.find(a => [a.cdAccount, a.odAccount, a.asgAccount].includes(String(accountNo)))
  if (!acc) return false
  acc.limits = acc.limits || {}
  acc.limits[module] = { status, updatedAt: new Date().toISOString() }
  save(accounts)
  return true
}

module.exports = { STORE_FILE, load, add, markLimit }

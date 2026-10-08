// Terminal questions shared by run-cypress.js and run-limit.js:
// pick saved account(s), pick a module, then run that module's limit spec.

const { spawnSync } = require('child_process')
const LIMIT_MODULES = require('./limitModules')

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

// Terminals started by VS Code can carry ELECTRON_RUN_AS_NODE, which stops Cypress from launching
const CYPRESS_ENV = { ...process.env }
delete CYPRESS_ENV.ELECTRON_RUN_AS_NODE

function describeAccount(acc){
  const limits = Object.entries(acc.limits || {}).map(([m, l]) => `${m} ${l.status}`)
  return `${acc.customerName} | ${acc.loanLimit} | CD ${acc.cdAccount} | OD ${acc.odAccount} | ASG ${acc.asgAccount}` +
    (limits.length ? ` | limit: ${limits.join(', ')}` : '')
}

// Asks until the answer is "all" or a comma list of valid numbers. Returns the chosen accounts.
async function askAccounts(ask, accounts){
  console.log('\nAccounts:')
  accounts.forEach((acc, i) => console.log(`  ${i + 1}) ${describeAccount(acc)}`))

  while (true) {
    const ans = (await ask('Which account do you want to create the Limit for? (number, e.g. 1 or 1,3, or all)', '1')).toLowerCase()
    if (ans === 'all') return accounts
    const nums = ans.split(',').map(s => Number(s.trim()))
    if (nums.length && nums.every(n => Number.isInteger(n) && n >= 1 && n <= accounts.length)) {
      return [...new Set(nums)].map(n => accounts[n - 1])
    }
    console.log(`  Enter numbers from 1 to ${accounts.length}, separated by commas, or "all".`)
  }
}

// Asks until a module with a limit automation is chosen.
async function askModule(ask){
  const codes = LIMIT_MODULES.map(m => m.spec ? m.code : `${m.code} (not automated yet)`)
  console.log(`\nModules: ${codes.join(', ')}`)

  while (true) {
    const ans = (await ask('Which module should the Limit be created in?', 'FF')).toUpperCase()
    const mod = LIMIT_MODULES.find(m => m.code === ans)
    if (mod && mod.spec) return mod
    console.log(mod ? `  ${mod.code} limit is not automated yet. Choose another module.` : `  Unknown module "${ans}".`)
  }
}

// Runs the module's limit spec for one account and returns Cypress's exit code.
// `open` launches the Cypress window instead (continues when it is closed).
function runLimit(mod, acc, { open = false, extraEnv = {} } = {}){
  // JSON keeps account numbers as strings, so leading zeros survive
  const env = JSON.stringify({ ...mod.env(acc), ...extraEnv })
  const args = open
    ? ['cypress', 'open', '--e2e', '--env', env]
    : ['cypress', 'run', '--headed', '--spec', mod.spec, '--env', env]

  console.log(`\nCreating ${mod.code} limit for ${describeAccount(acc)}`)
  const result = spawnSync(NPX, args, { stdio: 'inherit', env: CYPRESS_ENV })
  return result.status === null ? 1 : result.status
}

// Account → module → run, one account at a time. Returns 0 only if every run passed.
async function createLimits(ask, accounts, options = {}){
  const chosen = await askAccounts(ask, accounts)
  const mod = await askModule(ask)
  const extraEnv = options.extraEnv || {}

  let failed = 0
  for (const acc of chosen) {
    if (acc.limits && acc.limits[mod.code]) {
      console.log(`\nSkipping ${acc.customerName}: ${mod.code} limit already ${acc.limits[mod.code].status}`)
      continue
    }
    if (runLimit(mod, acc, { open: options.open, extraEnv }) !== 0) failed++
  }

  console.log(failed ? `\n${failed} limit run(s) failed.` : '\nLimit creation finished.')
  return failed ? 1 : 0
}

module.exports = { NPX, CYPRESS_ENV, describeAccount, askAccounts, askModule, runLimit, createLimits }

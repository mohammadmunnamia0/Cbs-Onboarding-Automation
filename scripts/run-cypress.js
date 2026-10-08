#!/usr/bin/env node
const readline = require('readline')
const { spawn, spawnSync } = require('child_process')
const accountStore = require('./accountStore')
const { NPX, CYPRESS_ENV, createLimits } = require('./limitPrompt')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal) {
  return new Promise(resolve => {
    rl.question(`${question} (${defaultVal}): `, ans => {
      if (!ans) return resolve(defaultVal)
      resolve(ans.trim())
    })
  })
}

async function askCount(question, defaultVal) {
  while (true) {
    const n = Number(await ask(question, defaultVal))
    if (Number.isInteger(n) && n >= 0) return n
    console.log('  Enter a whole number (0 or more).')
  }
}

async function askYesNo(question, defaultVal) {
  while (true) {
    const ans = (await ask(question, defaultVal)).toLowerCase()
    if (['y', 'yes'].includes(ans)) return true
    if (['n', 'no'].includes(ans)) return false
    console.log('  Enter yes or no.')
  }
}

;(async () => {
  try {
    // Each account = one customer with CD, OD and ASG accounts
    let count617, count619
    while (true) {
      count617 = await askCount('How many 617-type accounts?', '1')
      count619 = await askCount('How many 619-type accounts?', '0')
      if (count617 + count619 > 0) break
      console.log('  Create at least one account.')
    }
    const wantLimit = await askYesNo('Create Limits for these accounts after they are created? (yes/no)', 'no')

    const runId = new Date().toISOString()
    const env = JSON.stringify({ count617, count619, runId })

    if (!wantLimit) {
      // Same as before: open the Cypress window and pick create_accounts.cy.js
      rl.close()
      console.log(`Launching Cypress with env: ${env}`)
      const p = spawn(NPX, ['cypress', 'open', '--env', env], { stdio: 'inherit', env: CYPRESS_ENV })
      p.on('close', code => {
        console.log(`\nCreated accounts are saved in ${accountStore.STORE_FILE}`)
        console.log('Create a Limit for them later with: npm run limit:prompt')
        process.exit(code)
      })
      return
    }

    // Run straight through (browser visible) so the limit questions follow on their own
    console.log(`Creating accounts with env: ${env}`)
    spawnSync(NPX, ['cypress', 'run', '--headed', '--spec', 'cypress/e2e/create_accounts.cy.js', '--env', env], { stdio: 'inherit', env: CYPRESS_ENV })

    const created = accountStore.load().filter(a => a.runId === runId)
    if (!created.length) {
      rl.close()
      console.error('\nNo accounts were created, so there is nothing to create a Limit for.')
      process.exit(1)
    }
    console.log(`\n${created.length} of ${count617 + count619} account(s) created and saved in ${accountStore.STORE_FILE}`)

    const code = await createLimits(ask, created)
    rl.close()
    process.exit(code)
  } catch (e) {
    rl.close()
    console.error(e.message || e)
    process.exit(1)
  }
})()

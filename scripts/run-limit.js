#!/usr/bin/env node
const readline = require('readline')
const accountStore = require('./accountStore')
const { createLimits } = require('./limitPrompt')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal) {
  return new Promise(resolve => {
    rl.question(`${question} (${defaultVal}): `, ans => {
      if (!ans) return resolve(defaultVal)
      resolve(ans.trim())
    })
  })
}

// An account that was not created by this project, typed in by hand
async function askManualAccount() {
  return {
    customerName: await ask('Customer name (used to find the limit for approval)', 'D19 Autos'),
    odAccount: await ask('Loan account (must not have a limit yet)', '42193970119'),
    asgAccount: await ask('Assignment account of the same customer', '43193970119'),
    cdAccount: '-',
    loanLimit: '-',
    limits: {}
  }
}

;(async () => {
  try {
    const saved = accountStore.load()
    let accounts
    if (!saved.length) {
      console.log(`No saved accounts in ${accountStore.STORE_FILE}. Enter one by hand.`)
      accounts = [await askManualAccount()]
    } else {
      const source = (await ask(`Use a saved account (${saved.length} saved) or enter one by hand? (saved/manual)`, 'saved')).toLowerCase()
      accounts = source.startsWith('m') ? [await askManualAccount()] : saved
    }

    const buyerCount = await ask('How many buyers to add from the dropdown (number or all)?', '2')
    const mode = (await ask('Mode: open or run', 'run')).toLowerCase()

    const code = await createLimits(ask, accounts, { open: mode === 'open', extraEnv: { buyerCount } })
    rl.close()
    process.exit(code)
  } catch (e) {
    rl.close()
    console.error(e.message || e)
    process.exit(1)
  }
})()

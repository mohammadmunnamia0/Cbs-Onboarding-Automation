#!/usr/bin/env node
const readline = require('readline')
const { spawn } = require('child_process')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal) {
  return new Promise(resolve => {
    rl.question(`${question} (${defaultVal}): `, ans => {
      if (!ans) return resolve(defaultVal)
      resolve(ans)
    })
  })
}

;(async () => {
  try {
    const groupsCountAns = await ask('How many groups (each group = 3 accounts)?', '1')
    const groups619Ans = await ask('How many groups should use loanLimit 619 (last N groups)?', '0')
    rl.close()

    const groupsCount = Number(groupsCountAns) || 1
    const groups619 = Number(groups619Ans) || 0

    const envArg = `groupsCount=${groupsCount},groups619=${groups619}`

    console.log(`Launching Cypress with env: ${envArg}`)

    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const args = ['cypress', 'open', '--env', envArg]

    const p = spawn(cmd, args, { stdio: 'inherit' })
    p.on('close', code => process.exit(code))
  } catch (e) {
    rl.close()
    console.error(e)
    process.exit(1)
  }
})()

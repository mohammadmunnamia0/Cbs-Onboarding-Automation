/// <reference types="cypress" />

// Factoring Finance (FF) - Create Limit
//
// Maker logs in, creates a limit for one customer with two buyers and submits it.
// Authorizer then logs in, finds that limit by customer name and approves it.
//
// A limit can be created only once per loan account. Running again with the same
// account shows "CUSTOMER ALREADY ONBOARDED" after the Tick Mark, so pass a new
// account each run: pick a saved account with `npm run limit:prompt`, edit
// `limitData` below, or pass Cypress env:
//   npx cypress run --spec cypress/e2e/create_limit_ff.cy.js \
//     --env '{"loanAccount":"42193970119","assignmentAccount":"43193970119","customerName":"D19 Autos"}'

function env(name, fallback){
  try {
    const v = Cypress.env(name)
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
  } catch (e) {}
  return fallback
}

const limitData = {
  loginUrl: env('loginUrl', 'https://staging.optifin.sscl.tech/login'),

  makerUserID: env('makerUserID', 'cad_duo'),
  makerPassword: env('makerPassword', 'Prime123@'),
  authUserID: env('authUserID', 'cad03_auth'),
  authPassword: env('authPassword', 'Prime123@'),

  // Customer Information
  customerName: env('customerName', 'D19 Autos'), // used to find the limit on the approval page
  loanAccount: env('loanAccount', '42193970119'),
  assignmentAccount: env('assignmentAccount', '43193970119'),
  contactNumber: env('contactNumber', '01749653931'),
  businessNature: 'Service',
  gracePeriod: '10',
  penaltyRate: '2',
  interestRate: '9',
  invoiceProcessingRate: '0.2',
  safetyDepositRate: '1',
  customerFinancingRate: '80',

  // Buyers - picked from the Anchor Name search (no fixed names), skipping
  // anchors already added or with no remaining notional limit.
  // `buyerCount` is a number or 'all'. `limit` is lowered to the anchor's
  // remaining notional limit when that is smaller.
  buyerCount: env('buyerCount', '2'),
  buyer: { limit: '1000000', creditPeriod: '5', financingRate: '70' }
}

// Same rules the app enforces, checked up front so a bad edit fails fast
// with a clear message instead of a timeout halfway through the form.
function validateLimitData(d){
  const errors = []
  const num = v => Number(v)
  const isWhole = v => /^\d+$/.test(String(v))

  ;['penaltyRate', 'interestRate', 'invoiceProcessingRate', 'safetyDepositRate'].forEach(k => {
    if (num(d[k]) > 20) errors.push(`${k} (${d[k]}) cannot be above 20`)
  })
  if (num(d.customerFinancingRate) > 100) errors.push(`customerFinancingRate (${d.customerFinancingRate}) cannot be above 100`)
  if (!isWhole(d.gracePeriod) || num(d.gracePeriod) > 100) errors.push(`gracePeriod (${d.gracePeriod}) must be a whole number up to 100`)
  if (d.buyerCount !== 'all' && (!isWhole(d.buyerCount) || num(d.buyerCount) < 1)) {
    errors.push(`buyerCount (${d.buyerCount}) must be 'all' or a whole number of at least 1`)
  }

  const b = d.buyer
  if (!isWhole(b.creditPeriod)) errors.push(`buyer creditPeriod (${b.creditPeriod}) must be a whole number`)
  if (num(b.financingRate) > 100) errors.push(`buyer financingRate (${b.financingRate}) cannot be above 100`)
  if (num(b.financingRate) > num(d.customerFinancingRate)) {
    errors.push(`buyer financingRate (${b.financingRate}) cannot be above customerFinancingRate (${d.customerFinancingRate})`)
  }

  if (errors.length) throw new Error(`Invalid limitData:\n- ${errors.join('\n- ')}`)
}

// XPath selectors
const selectors = {
  // Login / Logout
  userId: "//input[@id='userId']",
  password: "//input[@id='password']",
  loginButton: "//button[@data-testid='login-button']",
  okButton: "//button[normalize-space()='OK']",
  accountOption: "//div[contains(@class,'rounded-full flex justify-center items-center border w-7 h-7 md:w-10 md:h-10 text-primary transition-all duration-300 ease-in-out cursor-pointer bg-white hover:bg-primary/10 border-gray hover:border-primary/50 hover:shadow-md')]//*[name()='svg']",
  logoutButton: "//button[@data-testid='logout-btn']",

  // Limit menu
  limitMenu: "//button[contains(@class,'menuCard')][.//span[normalize-space()='Limit']]",
  createLimitButton: "//button[@data-testid='create-limit-button']",

  // Customer Information page
  loanAccount: "//input[@placeholder='Enter Loan Account']",
  tickMark: "//button[contains(@class,'bg-primary text-white px-2 rounded-tr rounded-br text-sm')]",
  contactNumber: "//input[@data-testid='contactNumber']",
  assignmentAccount: "//input[@placeholder='Enter Assignment Account']",
  businessNature: "//select[@data-testid='businessNatureName']",
  gracePeriod: "//input[@data-testid='gracePeriod']",
  penaltyRate: "//input[@data-testid='penaltyRate']",
  interestRate: "//input[@data-testid='interestRate']",
  invoiceProcessingRate: "//input[@data-testid='invoiceProcessingRate']",
  safetyDepositRate: "//input[@data-testid='safetyDepositRate']",
  customerFinancingRate: "//input[@data-testid='supplierFinancingRate']",
  nextPage: "//button[@data-testid='tab-next-btn']",

  // Buyer Information page
  newBuyerButton: "//button[normalize-space()='New Anchor']",
  anchorName: "//input[@placeholder='Enter Anchor Name']",
  // Suggestions appear under Anchor Name only after something is typed
  anchorSuggestions: "//input[@placeholder='Enter Anchor Name']/following::li",
  anchorLimit: "//input[@placeholder='Enter Anchor Limit']",
  creditPeriod: "//input[@placeholder='Enter Credit Period']",
  financingRate: "//input[@placeholder='Enter Financing Rate']",
  addButton: "//button[normalize-space()='Add']",
  closeAnchorPopup: "//button[normalize-space()='Close']",
  submitButton: "//button[@class='button bg-primary text-white text-xs sm:text-sm px-2 sm:px-3 py-1' and text()='Submit ']",

  // Approval
  search: "//input[@data-testid='search']",
  searchIcon: "//span[@class='searchIcon']",
  approveButton: "//button[normalize-space()='Approve']"
}

describe('Factoring Finance - Create Limit', { defaultCommandTimeout: 60000, viewportWidth: 1920, viewportHeight: 1080 }, () => {
  before(() => {
    validateLimitData(limitData)
  })

  // Helpers

  const typeInto = (xpath, value) => {
    cy.xpath(xpath).scrollIntoView().should('be.visible').clear().type(value)
  }

  const clickOk = () => {
    cy.xpath(selectors.okButton).should('be.visible').click()
  }

  const login = (userId, password) => {
    cy.visit(limitData.loginUrl)
    typeInto(selectors.userId, userId)
    typeInto(selectors.password, password)
    cy.xpath(selectors.loginButton).should('be.visible').click()
    cy.wait(3000)

    // The EOD popup does not show on every login, so only click OK when it is there
    cy.get('body').then($body => {
      const ok = $body.find('button').filter((_, b) => Cypress.$(b).text().trim() === 'OK')
      if (ok.length) cy.wrap(ok.first()).click()
    })
  }

  const logout = () => {
    cy.wait(2000)
    cy.xpath(selectors.accountOption).should('be.visible').click()
    cy.wait(1000)
    cy.xpath(selectors.logoutButton).should('be.visible').click()
  }

  const openLimitMenu = () => {
    cy.wait(3000)
    cy.contains('button', 'Factoring Finance', { timeout: 120000 }).scrollIntoView().should('be.visible').click()
    cy.xpath(selectors.limitMenu).scrollIntoView().should('be.visible').click()
  }

  // Anchor Name only lists anchors that match what is typed, so we type one
  // letter at a time and take the first suggestion not tried yet.
  const SEARCH_LETTERS = 'aeioubcdfghjklmnpqrstvwxyz'.split('')

  const visibleByXpath = (doc, xpath) => {
    const r = doc.evaluate(xpath, doc, null, 7 /* ORDERED_NODE_SNAPSHOT_TYPE */, null)
    return Array.from({ length: r.snapshotLength }, (_, i) => r.snapshotItem(i))
      .filter(el => Cypress.$(el).is(':visible'))
  }

  // Number shown under "Remaining Notional Limit", or null if it cannot be read
  const readRemainingLimit = () => {
    return cy.contains('Remaining Notional Limit').parent().invoke('text').then(text => {
      const m = text.replace('Remaining Notional Limit', '').replace(/,/g, '').match(/-?\d+(\.\d+)?/)
      return m ? Number(m[0]) : null
    })
  }

  // Selects an anchor that is not in `tried` and has remaining limit.
  // Yields { name, remaining } or null when no letter finds one.
  const pickAnchor = (tried, letters = SEARCH_LETTERS) => {
    if (!letters.length) return cy.wrap(null)
    const [letter, ...rest] = letters

    typeInto(selectors.anchorName, letter)
    cy.wait(1500)
    return cy.document().then(doc => {
      const option = visibleByXpath(doc, selectors.anchorSuggestions)
        .find(el => {
          const name = Cypress.$(el).text().trim()
          return name && !tried.has(name)
        })
      if (!option) return pickAnchor(tried, rest)

      const name = Cypress.$(option).text().trim()
      cy.wrap(option).click()
      cy.wait(1500)
      // The box shows 0.00 until the anchor's details load, so read twice before skipping
      return readRemainingLimit().then(first => {
        if (first === null || first > 0) return first
        cy.wait(2000)
        return readRemainingLimit()
      }).then(remaining => {
        if (remaining !== null && remaining <= 0) {
          cy.log(`Skipping anchor ${name}: no remaining notional limit`)
          tried.add(name)
          return pickAnchor(tried, letters)
        }
        return { name, remaining }
      })
    })
  }

  // Adds `buyerCount` anchors (or every one it can find for 'all').
  // Stops early when the search finds no new anchor with remaining limit.
  const addBuyers = (tried = new Set(), added = []) => {
    const target = limitData.buyerCount === 'all' ? Infinity : Number(limitData.buyerCount)
    if (added.length >= target) return

    cy.xpath(selectors.newBuyerButton).scrollIntoView().should('be.visible').click()
    pickAnchor(tried).then(anchor => {
      if (!anchor) {
        if (!added.length) throw new Error('No anchor with remaining notional limit was found in the Anchor Name search')
        cy.log(`Only found ${added.length} anchor(s): ${added.join(', ')}`)
        cy.xpath(selectors.closeAnchorPopup).should('be.visible').click()
        return
      }

      // The limit cannot be more than what the anchor has left
      const configured = Number(limitData.buyer.limit)
      const limit = anchor.remaining === null ? configured : Math.min(configured, Math.floor(anchor.remaining))
      cy.log(`Adding anchor ${anchor.name} with limit ${limit}`)

      typeInto(selectors.anchorLimit, String(limit))
      typeInto(selectors.creditPeriod, limitData.buyer.creditPeriod)
      typeInto(selectors.financingRate, limitData.buyer.financingRate)

      cy.xpath(selectors.addButton).scrollIntoView().should('be.visible').click()
      cy.wait(1000)
      tried.add(anchor.name)
      addBuyers(tried, [...added, anchor.name])
    })
  }

  it(`Maker creates FF limit for ${limitData.customerName} (loan account ${limitData.loanAccount})`, () => {
    login(limitData.makerUserID, limitData.makerPassword)
    openLimitMenu()

    cy.xpath(selectors.createLimitButton).should('be.visible').click()
    // The Create Limit form does not always render cleanly on first load
    cy.wait(2000)
    cy.reload(true)
    cy.wait(3000)

    // Customer Information - Tick Mark pulls the customer details from CBS
    typeInto(selectors.loanAccount, limitData.loanAccount)
    cy.xpath(selectors.tickMark).should('be.visible').click()
    cy.xpath(selectors.okButton).should('be.visible')
    cy.get('body').then($body => {
      if (/already onboarded/i.test($body.text())) {
        throw new Error(`Loan account ${limitData.loanAccount} already has a limit (CUSTOMER ALREADY ONBOARDED). Use a new loanAccount.`)
      }
    })
    clickOk()

    typeInto(selectors.contactNumber, limitData.contactNumber)
    typeInto(selectors.assignmentAccount, limitData.assignmentAccount)
    cy.xpath(selectors.businessNature).scrollIntoView().should('be.visible').select(limitData.businessNature)
    typeInto(selectors.gracePeriod, limitData.gracePeriod)
    typeInto(selectors.penaltyRate, limitData.penaltyRate)
    typeInto(selectors.interestRate, limitData.interestRate)
    typeInto(selectors.invoiceProcessingRate, limitData.invoiceProcessingRate)
    typeInto(selectors.safetyDepositRate, limitData.safetyDepositRate)
    typeInto(selectors.customerFinancingRate, limitData.customerFinancingRate)

    cy.xpath(selectors.nextPage).scrollIntoView().should('be.visible').click()
    cy.wait(2000)

    // Buyer Information
    addBuyers()

    cy.wait(2000)
    cy.xpath(selectors.submitButton).should('be.visible').click()
    clickOk()
    // Saved accounts (cypress/fixtures/created_accounts.json) remember the limit
    cy.task('markLimit', { accountNo: limitData.loanAccount, module: 'FF', status: 'submitted' })

    logout()
  })

  it(`Authorizer approves FF limit for ${limitData.customerName}`, () => {
    login(limitData.authUserID, limitData.authPassword)
    openLimitMenu()

    cy.wait(2000)
    typeInto(selectors.search, limitData.customerName)
    cy.xpath(selectors.searchIcon).should('be.visible').click()
    cy.wait(2000)

    // Tick only this customer's row, so other pending limits are never approved by accident
    cy.contains('[role="row"], tr', limitData.customerName)
      .find('input[type="checkbox"]')
      .first()
      .should('be.visible')
      .click()

    cy.xpath(selectors.approveButton).should('be.visible').click()
    clickOk()
    cy.task('markLimit', { accountNo: limitData.loanAccount, module: 'FF', status: 'approved' })

    logout()
  })
})

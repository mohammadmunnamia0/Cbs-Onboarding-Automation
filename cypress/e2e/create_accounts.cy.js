/// <reference types="cypress" />

// Dynamic data generation: produces groups of 3 accounts each (CD, OD, ASG)
// Default to 1 group. Can be overridden with Cypress env `groupsCount`
// or process env `GROUPS_COUNT`.

const groupsCount = (() => {
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

const groupsWith619 = (() => {
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

function randItem(arr){
  return arr[Math.floor(Math.random()*arr.length)]
}

function randNumeric(len){
  let s = ''
  for(let i=0;i<len;i++) s += Math.floor(Math.random()*10)
  return s
}

const companyPrefixes = [
  // Traditional Bangladeshi names
  'Janata', 'Sonali', 'Rupali', 'Purbani', 'Purabi', 'Uttara', 'Dakshin',
  'Pubali', 'Modhumoti', 'Meghna', 'Padma', 'Jamuna', 'Karnaphuli', 'Surma',
  'Titas', 'Teesta', 'Shitalakkhya', 'Buriganga', 'Dhansiri', 'Rupsha',

  // Popular Bangladeshi-style prefixes
  'Asha', 'Alif', 'Aman', 'Bismillah', 'Noor', 'Rahman', 'Karim', 'Hasan',
  'Hossain', 'Islam',

  // Modern business names
  'Prime', 'Apex', 'Elite', 'Royal', 'Green', 'Golden', 'Smart', 'Future',
  'Vision', 'Pioneer',

  // Nature-based
  'Sunrise', 'Sunset', 'Morning', 'Moonlight', 'Star', 'Galaxy', 'Sky',
  'Ocean', 'River', 'Hill',

  // Local style
  'Nahar', 'Al-Madina', 'Al-Amin', 'Al-Hera', 'New Vision', 'Modern',
  'Citizen', 'National', 'Eastern', 'Western', 'Northern', 'Southern',
  'Unity', 'Trust', 'Progress', 'Success', 'Prosper', 'Harmony', 'Reliable',

  // Additional useful prefixes
  'Bangla', 'Bengal', 'Desh', 'Probash', 'Sundar', 'Shakti', 'Pragati',
  'Somoy', 'Dhaka', 'Chiro', 'Priyo', 'Shonar', 'Teesta', 'Samriddhi',
  'Bandhu', 'Mukti', 'Sundarban', 'Purbasha', 'Nabab', 'Joy', 'Neel',
  'Noya', 'Protic', 'Swapno', 'Noor', 'Tara', 'Majhi', 'Nodi', 'Srishti',
  'Protyasha', 'Chaya', 'Alo', 'Jibon', 'Pran', 'Shapla', 'Bashundhara',
  'Mithila', 'Akash', 'Milan', 'Jagoron', 'Palli', 'Bangabandhu', 'Mujib',
  'Shanti', 'Sahaj', 'Kamal', 'Nirman'
]

const companySuffixes = [
  'Brothers', 'Traders', 'Enterprise', 'Corporation',
  'Industries', 'Agency', 'Store', 'Mart', 'Center',
  'Bazar', 'Depot', 'Warehouse', 'Complex',

  // Textile & garments
  'Knitwear', 'Textiles', 'Fashions', 'Apparels', 'Garments', 'Composite',
  'Spinning', 'Weaving', 'Denim', 'Fabrics',

  // Agro & food
  'Agro', 'Agro Farm', 'Agro Industries', 'Foods', 'Food Products', 'Dairy',
  'Hatchery', 'Fisheries', 'Poultry', 'Rice Mills',

  // Industrial
  'Engineering', 'Engineering Works', 'Steel', 'Iron Works', 'Cement',
  'Ceramics', 'Plastic', 'Packaging', 'Printing', 'Paper Mills',

  // Logistics
  'Logistics', 'Transport', 'Cargo', 'Freight', 'Shipping', 'Courier',
  'Delivery', 'Movers', 'Warehouse', 'Supply Chain',

  // Technology
  'Technologies', 'Technology', 'Software', 'Solutions', 'Digital',
  'IT', 'Networks', 'Communications', 'Innovations',

  // Construction
  'Builders', 'Developers', 'Construction', 'Real Estate', 'Properties',
  'Housing', 'Infrastructure', 'Design', 'Interiors', 'Architecture',

  // General business suffixes
  // 'Ltd', 'Limited', 'PLC', 'Inc', 'Incorporated', 'LLC', 'LLP', 'LP', 'International', 'Worldwide', 
  'Corp', 'Company', 'Co', 'Group', 'Holdings', 'Ventures', 'Global','Associates'
]

function randCompanyName(){
  const prefix = randItem(companyPrefixes)
  const suffix = randItem(companySuffixes)
  return `${prefix} ${suffix}`
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
    })
  })
})

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

const firstNames = ['Abdul','Mohammad','Shahidul','Farhana','Sultana','Jannatul','Nusrat','Tanvir','Rakib','Mehedi','Sabbir','Arif','Mizanur','Sharmin','Afsana','Aarav','Aisha','Ayan','Alyssa','Zayn','Zara','Noor','Ishaan','Kiara','Riya','Rayyan','Esha','Aria','Mia','Noah','Sofia','Lina','Rayan','Amina','Mina','Rashid','Sadia','Tariq','Nabila','Fahim','Rumana','Shamim','Jannat','Rafiq','Ayesha','Farhan','Aminul','Shamima']
const lastNames = ['Karim','Ali','Islam','Yasmin','Begum','Ferdous','Jahan','Ahmed','Hasan','Hossain','Rahman','Akter','Mimi','Khan','Sarker','Hassan','Sultana','Haque','Chowdhury','Biswas','Roy','Mitra','Shah','Faruk','Nandy','Das','Malik','Rana','Chowdhury','Siddique','Khatun','Mollah','Shikder','Bhuiyan','Talukder','Majumder','Sultana','Jahan','Kabir','Haque','Morshed','Faruque','Nahar','Parvin','Rashid','Shamim']

// ------------------------------------------------------- //

// const firstNames = [
//   'Md. Abdul','Md. Abdur','Md. Abul','Md. Al Amin','Md. Al Mamun',
//   'Md. Anisur','Md. Ashraful','Md. Delwar','Md. Enamul','Md. Faruk',
//   'Md. Golam','Md. Habibur','Md. Hasan','Md. Helal','Md. Humayun',
//   'Md. Imran','Md. Iqbal','Md. Jahangir','Md. Jamal','Md. Kamal',
//   'Md. Khairul','Md. Mahbub','Md. Mahfuz','Md. Mahmud','Md. Manir',
//   'Md. Mizanur','Md. Monir','Md. Mostafizur','Md. Mosharraf','Md. Nazmul',
//   'Md. Nurul','Md. Rafiqul','Md. Rashed','Md. Rezaul','Md. Ruhul',
//   'Md. Saiful','Md. Salahuddin','Md. Shah Alam','Md. Shahidul','Md. Shariful',
//   'Md. Shafiqul','Md. Shakil','Md. Shamim','Md. Sohag','Md. Tanvir',
//   'Md. Tareq','Md. Touhid','Md. Zahirul','Md. Ziaur',

//   'Abdullah','Abdur Rahman','Abdur Razzak','Akash','Al Amin',
//   'Al Mamun','Aminul','Anisur','Arif','Ashraful',
//   'Delwar','Elias','Emon','Enayet','Farhan',
//   'Fahim','Faisal','Habib','Hasan','Hridoy',
//   'Imran','Jahid','Jewel','Joy','Kabir',
//   'Mahadi','Mahfuz','Mahmud','Mamun','Masud',
//   'Mehedi','Milon','Mizan','Monir','Nahid',
//   'Nazmul','Nayeem','Noman','Parvez','Rakib',
//   'Rasel','Rashed','Rifat','Riyad','Sabbir',
//   'Saif','Shafiq','Shahin','Shakib','Shamim',
//   'Sharif','Sohel','Sumon','Tanvir','Tareq',

//   'Aklima','Amena','Anika','Ayesha','Afroza',
//   'Afsana','Anwara','Beauty','Dilruba','Farhana',
//   'Fatema','Ferdousi','Halima','Hosne Ara','Jannat',
//   'Jannatul','Jesmin','Kaniz','Khadija','Laboni',
//   'Lubna','Mahfuza','Marjina','Mim','Mita',
//   'Monira','Mousumi','Nasima','Nazma','Nargis',
//   'Nila','Nishi','Nusrat','Parvin','Poly',
//   'Rina','Roksana','Rokeya','Rumana','Sabina',
//   'Sadia','Salma','Sanjida','Sharmin','Shamima',
//   'Shathi','Shila','Shirin','Sonia','Sufia',
//   'Sumaiya','Tania','Taslima','Trisha','Umme Habiba','Yasmin'
// ];

// const lastNames = [
//   'Ahmed','Akter','Ali','Anam','Ansari',
//   'Azad','Babu','Barua','Basak','Bepari',
//   'Begum','Bhuiyan','Biswas','Bormon','Chakraborty',
//   'Chowdhury','Das','Datta','Dewan','Fakir',
//   'Faruque','Ferdous','Gazi','Ghosh','Haque',
//   'Hasan','Hossain','Howlader','Hawlader','Huq',
//   'Imam','Islam','Jahan','Joarder','Kabir',
//   'Karmakar','Karim','Kazi','Khan','Khondoker',
//   'Khatun','Mia','Miah','Majumder','Mallick',
//   'Malik','Miah','Mirdha','Mollah','Mondal',
//   'Morshed','Munshi','Nahar','Nandi','Parvin',
//   'Patwary','Pramanik','Rahman','Rahman Khan','Rana',
//   'Rashid','Roy','Saha','Sarker','Sarkar',
//   'Sattar','Shaikh','Shamim','Shikder','Siddique',
//   'Sikder','Talukdar','Talukder','Uddin','Ullah',
//   'Yasmin'
// ];

// ------------------------------------------------------- //


// const firstNames = [
//   // Game of Thrones
//   'Jon','Arya','Sansa','Bran','Robb','Rickon','Ned','Catelyn',
//   'Daenerys','Tyrion','Jaime','Cersei','Brienne','Sandor',
//   'Jorah','Samwell','Theon','Ygritte','Oberyn','Ellaria',
//   'Margaery','Stannis','Melisandre','Davos','Bronn','Gendry',

//   // Breaking Bad
//   'Walter','Jesse','Skyler','Hank','Marie','Saul',
//   'Gustavo','Mike','Tuco','Lydia','Todd','Jane',

//   // Money Heist
//   'Sergio','Raquel','Tokyo','Rio','Nairobi',
//   'Berlin','Denver','Monica','Arturo','Palermo',
//   'Helsinki','Oslo','Bogota','Lisbon','Alicia',

//   // Hollywood Actors
//   'Leonardo','Brad','Tom','Robert','Chris',
//   'Ryan','Dwayne','Keanu','Johnny','Will',
//   'Morgan','Samuel','Christian','Matt','Ben',
//   'Daniel','Hugh','Jason','Mark','Henry',

//   // Hollywood Actresses
//   'Scarlett','Jennifer','Emma','Margot','Natalie',
//   'Angelina','Charlize','Gal','Anne','Julia',
//   'Sandra','Nicole','Emily','Zendaya','Florence',
//   'Jessica','Amy','Meryl','Cate','Dakota'
// ];

// const lastNames = [
//   // Game of Thrones Houses
//   'Stark','Lannister','Targaryen','Baratheon',
//   'Tyrell','Greyjoy','Martell','Bolton',
//   'Mormont','Clegane','Tarly','Arryn',
//   'Frey','Baelish','Seaworth',

//   // Breaking Bad
//   'White','Pinkman','Schrader','Goodman',
//   'Fring','Ehrmantraut','Salamanca','Cantillo',
//   'Beneke','Varga',

//   // Money Heist
//   'Marquina','Murillo','Oliveira','Ramos',
//   'Vicuña','Jimenez','Montero','Roman',
//   'Suarez','Silva',

//   // Hollywood Actors
//   'DiCaprio','Pitt','Cruise','Downey',
//   'Hemsworth','Reynolds','Johnson','Reeves',
//   'Depp','Smith','Freeman','Jackson',
//   'Bale','Damon','Affleck','Radcliffe',
//   'Jackman','Statham','Ruffalo','Cavill',

//   // Hollywood Actresses
//   'Johansson','Lawrence','Stone','Robbie',
//   'Portman','Jolie','Theron','Gadot',
//   'Hathaway','Roberts','Bullock','Kidman',
//   'Blunt','Zendaya','Pugh','Chastain',
//   'Streep','Blanchett','Johnson','Watson'
// ];

//---------------------------------------------------------//

// Build groups: each group has one customerId, a cdAccount (used for all three), and three unique accountNos
const accounts = Array.from({length: groupsCount}, (_, i) => {
  const cdAccount = randNumeric(11)
  return {
    accountNos: [cdAccount, randNumeric(11), randNumeric(11)],
    customerId: randNumeric(8),
    cdAccount // CD account number (first account)
  }
})

// Random name generator
function randName(){
  return `${randItem(firstNames)} ${randItem(lastNames)}`
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
      const baseName = randName()
      const suffixes = ['CD','OD','ASG']

      // Helper to fill common fields and submit
      const createAccount = (accNo, custId, cdAcc, type, finalName) => {
        cy.log(`Creating ${type} account ${accNo}`)
        cy.get(selectors.addAccountButton).should('be.visible').click()
        cy.wait(400)

        cy.get(selectors.accountNo).clear().type(accNo)
        cy.get(selectors.customerId).clear().type(custId)
        cy.get(selectors.cdAccount).clear().type(cdAcc)
        cy.get(selectors.totalCreditLimit).clear().type('10000000')
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

        cy.get(selectors.limitExpiryDate).clear().type('2030-08-31')
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
      const cdName = is619Group ? `${baseName} CD FF` : `${baseName} CD`
      createAccount(cdAccNo, custId, cdAccNo, 'CD', cdName)

      // Create OD
      const odAccNo = entry.accountNos[1]
      const odName = is619Group ? `${baseName} OD FF` : `${baseName} OD`
      createAccount(odAccNo, custId, cdAccNo, 'OD', odName)

      // Create ASG
      const asgAccNo = entry.accountNos[2]
      const asgName = is619Group ? `${baseName} ASG FF` : `${baseName} ASG`
      createAccount(asgAccNo, custId, cdAccNo, 'ASG', asgName)
    })
  })
})

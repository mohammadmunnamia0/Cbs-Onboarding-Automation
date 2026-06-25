/// <reference types="cypress" />

describe('Debug - Inspect page structure', () => {
  it('logs page HTML to see actual structure', () => {
    cy.visit('/')
    cy.wait(2000)
    
    // Log the entire page HTML
    cy.document().then(doc => {
      cy.log('Page Title: ' + doc.title)
      cy.log('Page HTML length: ' + doc.documentElement.outerHTML.length)
    })
    
    // Try to find the Add Account button by different methods
    cy.log('Looking for Add Account button...')
    
    // Method 1: XPath from user
    cy.xpath('/html/body/div[2]/div[3]/div[2]/button[3]')
      .then($el => {
        if($el.length > 0) {
          cy.log('✓ XPath button found: ' + $el.text())
        } else {
          cy.log('✗ XPath button NOT found')
        }
      })
      .catch(() => cy.log('✗ XPath button error'))
    
    // Method 2: Look for any button with "Add" text
    cy.get('button:contains("Add")').then($btn => {
      cy.log(`Found ${$btn.length} buttons with "Add" text`)
      $btn.each((i, btn) => cy.log(`Button ${i}: ${btn.textContent}`))
    }).catch(() => cy.log('No buttons with "Add" found'))
    
    // Method 3: Look for any form
    cy.get('form').then($form => {
      cy.log(`Found ${$form.length} forms on page`)
    }).catch(() => cy.log('No forms found'))
    
    // Method 4: Check for input fields
    cy.get('input').then($inp => {
      cy.log(`Found ${$inp.length} input fields on page`)
    }).catch(() => cy.log('No inputs found'))
  })
})

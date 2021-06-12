/// <reference types="cypress" />

context('Waiting', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8080/');
  })

  describe('Interface tests', () => {

    it('Loads the interface', () => {
      cy.title().should('eq', 'Logstash Pipeline Tester');
    })

    it('Should connect to backend', () => {
      cy.get('button#backend-status.btn-success');
    })

    it('Should connect to logstash', () => {
      cy.get('button#logstash-status.btn-success', {timeout: 60000});
    })

    it('Should pre-select port and protocol automatically', () => {
      cy.get('select#pipeline-select').select('generic-json');
      cy.get('input#send-port').should('have.value', '5060');
      cy.get('select#send-protocol').should('have.value', 'TCP');
    })

    it('Should get a json reply when sending valid json to generic-json', () => {
      cy.get('select#pipeline-select').select('generic-json');
      cy.get('input#send-port').should('have.value', '5060');
      cy.get('select#send-protocol').should('have.value', 'TCP');
      cy.get('textarea#send-string').type('\{"test": 123\}', {parseSpecialCharSequences: false});
      cy.get('button#send-button').click();
      cy.get('div#json-pretty pre').should('contain.text', '"test": 123');
    })

  })
})

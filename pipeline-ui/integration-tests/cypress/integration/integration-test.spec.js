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
      cy.get('[data-cy=backend-status-badge] span.MuiBadge-badge svg', {timeout: 4000})
          .should('have.class', 'MuiSvgIcon-colorSuccess');
    })

    it('Should connect to logstash', () => {
      cy.get('[data-cy=logstash-status-badge] span.MuiBadge-badge svg', {timeout: 4000})
          .should('have.class', 'MuiSvgIcon-colorSuccess');
    })

    it('Should pre-select port and protocol automatically', () => {
      cy.get('[data-cy="pipeline-select"]').click();
      cy.get('[data-cy="pipeline-menu-item-generic-json"').click();
      cy.get('[data-cy="send-port"] input').should('have.value', '5060');
    })

    it('Should get a json reply when sending valid json to generic-json', () => {
      cy.get('[data-cy="pipeline-select"]').click();
      cy.get('[data-cy="pipeline-menu-item-generic-json"').click();
      cy.get('[data-cy="raw-logs-input"] textarea').first()
          .type('{"test": 123}', {parseSpecialCharSequences: false});
      cy.get('[data-cy="send-raw-logs"]').click({force: true});
      cy.get(
          '[data-cy="logstash-result"] pre', {timeout: 60000})
          .should('contain.text', '"test": 123', );
    })

    it.only('Should be able to copy result', () => {
      cy.get('[data-cy="pipeline-select"]').click();
      cy.get('[data-cy="pipeline-menu-item-generic-json"').click();
      cy.get('[data-cy="raw-logs-input"] textarea').first()
          .type('{"test": 123}', {parseSpecialCharSequences: false});
      cy.get('[data-cy="send-raw-logs"]').click();
      cy.get(
          '[data-cy="logstash-result"] pre', {timeout: 60000})
          .should('contain.text', '"test": 123', );
      cy.get('[data-cy="logstash-result-container"] [data-cy="copy-result-button').should('be.hidden');
      cy.get('[data-cy="logstash-result-container"]').trigger('mouseover');
      cy.get('[data-cy="logstash-result-container"] [data-cy="copy-result-button').should('be.visible');
      cy.get('[data-cy="logstash-result-container"] [data-cy="copy-result-button').click();
      cy.window()
          .its('navigator.clipboard')
          .invoke('readText')
          .then(text => {expect(text).to.contain('"test": 123')});
    })


  })
})

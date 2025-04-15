const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  chromeWebSecurity: false,
  e2e: {
    baseUrl: `http://${process.env.BACKEND_IP || 'localhost'}:8080`,
    setupNodeEvents(on, config) {
      // pass environment variables to Cypress
      config.env.BACKEND_IP = process.env.BACKEND_IP;
      return config;
    },
  },
})

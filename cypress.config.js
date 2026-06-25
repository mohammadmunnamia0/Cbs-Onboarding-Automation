const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://staging.optifin.sscl.tech/cbs-service/accounts",
    supportFile: "cypress/support/e2e.js",
    browser: "chrome",
    setupNodeEvents(on, config) {
      // configure plugins here if needed
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});

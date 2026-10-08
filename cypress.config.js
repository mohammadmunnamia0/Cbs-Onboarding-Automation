const { defineConfig } = require("cypress");
const accountStore = require("./scripts/accountStore");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://staging.optifin.sscl.tech/cbs-service/accounts",
    supportFile: "cypress/support/e2e.js",
    browser: "chrome",
    setupNodeEvents(on, config) {
      // Saved accounts live in cypress/fixtures/created_accounts.json
      on("task", {
        saveCreatedAccount(record) {
          accountStore.add(record);
          return null;
        },
        markLimit({ accountNo, module, status }) {
          return accountStore.markLimit(accountNo, module, status);
        },
      });
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

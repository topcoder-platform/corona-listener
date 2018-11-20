/**
 * Contains generic test helper methods
 */
require('../src/bootstrap')
const testConfig = require('./testConfig')

/**
 * Wait for configured time.
 */
async function wait () {
  await new Promise((resolve) => setTimeout(() => resolve(), testConfig.WAIT_MS))
}

module.exports = {
  wait
}

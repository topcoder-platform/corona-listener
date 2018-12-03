/**
 * The test config parameters.
 */

module.exports = {
  // the time in milliseconds to wait, this is used to wait for some processing completion
  WAIT_MS: (process.env.WAIT_MS && Number(process.env.WAIT_MS)) || 4000,
  USE_MOCK: process.env.USE_MOCK ? process.env.USE_MOCK.toLowerCase() === 'true' : true,
  TEST_PORT: (process.env.TEST_PORT && parseInt(process.env.TEST_PORT)) || 8888
}

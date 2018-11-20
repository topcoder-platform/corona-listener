/**
 * The test config parameters.
 */

module.exports = {
  // the time in milliseconds to wait, this is used to wait for some processing completion
  WAIT_MS: (process.env.WAIT_MS && Number(process.env.WAIT_MS)) || 4000
}

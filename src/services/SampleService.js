/**
 * Sample service.
 */
const logger = require('../common/logger')

/**
 * Get welcome message.
 * @returns {String} the welcome message
 */
async function getMessage () {
  return 'Hello World'
}

// Exports
module.exports = {
  getMessage
}

logger.buildService(module.exports)

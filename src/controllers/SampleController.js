/**
 * Contains endpoints related to sample API.
 */
const service = require('../services/SampleService')

/**
 * Get welcome message.
 * @param req the request
 * @param res the response
 */
async function getMessage (req, res) {
  const message = await service.getMessage()
  res.send(message)
}

// Exports
module.exports = {
  getMessage
}

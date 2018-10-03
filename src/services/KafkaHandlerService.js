/**
 * Service for Kafka handler.
 */
const Joi = require('joi')
const logger = require('../common/logger')

/**
 * Handle Kafka message.
 * @param {Object} message the Kafka message in JSON format
 */
async function handle (message) {
  // simply log message
  logger.info(`Kafka message: ${JSON.stringify(message, null, 4)}`)
}

handle.schema = {
  message: Joi.object().keys({
    topic: Joi.string().required(),
    originator: Joi.string().required(),
    timestamp: Joi.date().required(),
    'mime-type': Joi.string().required(),
    payload: Joi.object().required()
  }).required()
}

// Exports
module.exports = {
  handle
}

logger.buildService(module.exports)

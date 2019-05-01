/**
 * Service for Kafka handler.
 */
const Joi = require('joi')
const _ = require('lodash')
const logger = require('../common/logger')
const helper = require('../common/helper')

/**
 * Process user registration (unregistration) message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processUserRegistration (message) {
  if (message.topic !== 'challenge.notification.events') {
    return false
  }
  const type = _.get(message, 'payload.type', '').toUpperCase()
  if (type !== 'USER_REGISTRATION' && type !== 'USER_UNREGISTRATION') {
    return false
  }

  const challengeId = message.payload.data.challengeId

  // matched
  logger.info('It is user registration (unregistration) message.')
  // get m2m token
  const token = await helper.getM2Mtoken()
  // get challenge details
  const challenge = await helper.getChallengeDetails(challengeId, token)
  const challengeName = _.get(challenge, 'result.content.challengeName', '')
  const challengeType = _.get(challenge, 'result.content.challengeType', '')
  const challengePrizes = _.get(challenge, 'result.content.prize', [])
  const projectId = _.get(challenge, 'result.content.projectId')

  // get user details
  const user = await helper.getUserDetails(message.payload.data.userId, token)
  const user2 = await helper.getUserDetailsByHandle(_.get(user, 'result.content[0].handle'))
  const firstName = _.get(user, 'result.content[0].firstName', '')
  const lastName = _.get(user, 'result.content[0].lastName', '')
  const photoURL = _.get(user2, 'result.content.photoURL', '')
  const location = _.get(user2, 'result.content.homeCountryCode')
  const handle = _.get(user2, 'result.content.handle')
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    firstName,
    lastName,
    photoURL,
    createdAt: message.timestamp,
    location,
    handle,
    type,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Process add resource message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processAddResource (message) {
  if (message.topic !== 'challenge.notification.events') {
    return false
  }
  const type = _.get(message, 'payload.type', '').toUpperCase()
  if (type !== 'ADD_RESOURCE') {
    return false
  }

  const challengeId = message.payload.data.challengeId

  // matched
  logger.info('It is add resource message.')
  // get m2m token
  const token = await helper.getM2Mtoken()
  // get challenge details
  const challenge = await helper.getChallengeDetails(challengeId, token)
  const challengeName = _.get(challenge, 'result.content.challengeName', '')
  const challengeType = _.get(challenge, 'result.content.challengeType', '')
  const challengePrizes = _.get(challenge, 'result.content.prize', [])
  const projectId = _.get(challenge, 'result.content.projectId')

  // get user details
  const user = await helper.getUserDetails(message.payload.data.request.resourceUserId, token)
  const user2 = await helper.getUserDetailsByHandle(_.get(user, 'result.content[0].handle'))
  const firstName = _.get(user, 'result.content[0].firstName', '')
  const lastName = _.get(user, 'result.content[0].lastName', '')
  const photoURL = _.get(user2, 'result.content.photoURL', '')
  const location = _.get(user2, 'result.content.homeCountryCode')
  const handle = _.get(user2, 'result.content.handle')
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    firstName,
    lastName,
    photoURL,
    createdAt: message.timestamp,
    location,
    handle,
    type,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Process update draft or activate challenge message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processUpdateDraftOrActivateChallenge (message) {
  if (message.topic !== 'challenge.notification.events') {
    return false
  }
  const type = _.get(message, 'payload.type', '').toUpperCase()
  if (type !== 'UPDATE_DRAFT_CHALLENGE' && type !== 'ACTIVATE_CHALLENGE') {
    return false
  }

  const challengeId = message.payload.data.id

  // matched
  logger.info('It is update draft or activate challenge message.')
  let challengeName = _.get(message, 'payload.data.name')
  let challengeType = _.get(message, 'payload.data.finalDeliverableTypes')
  let challengePrizes = _.get(message, 'payload.data.prizes')
  let projectId = _.get(message, 'payload.data.projectId')
  if (!challengeName || !challengeType || !challengePrizes || challengePrizes.length === 0 || !projectId) {
    // get challenge details
    const challenge = await helper.getChallengeDetails(challengeId)
    challengeName = _.get(challenge, 'result.content.challengeName', '')
    challengeType = _.get(challenge, 'result.content.challengeType', '')
    challengePrizes = _.get(challenge, 'result.content.prize', [])
    projectId = _.get(challenge, 'result.content.projectId')
  }
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    createdAt: message.timestamp,
    type,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Process close task message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processCloseTask (message) {
  if (message.topic !== 'challenge.notification.events') {
    return false
  }
  const type = _.get(message, 'payload.type', '').toUpperCase()
  if (type !== 'CLOSE_TASK') {
    return false
  }

  const challengeId = message.payload.data.challengeId

  // matched
  logger.info('It is close task message.')
  // get m2m token
  const token = await helper.getM2Mtoken()
  // get challenge details
  const challenge = await helper.getChallengeDetails(challengeId, token)
  const challengeName = _.get(challenge, 'result.content.challengeName', '')
  const challengeType = _.get(challenge, 'result.content.challengeType', '')
  const challengePrizes = _.get(challenge, 'result.content.prize', [])
  const projectId = _.get(challenge, 'result.content.projectId')

  // get user details
  const user = await helper.getUserDetails(message.payload.data.userId, token)
  const user2 = await helper.getUserDetailsByHandle(_.get(user, 'result.content[0].handle'))
  const firstName = _.get(user, 'result.content[0].firstName', '')
  const lastName = _.get(user, 'result.content[0].lastName', '')
  const photoURL = _.get(user2, 'result.content.photoURL', '')
  const location = _.get(user2, 'result.content.homeCountryCode')
  const handle = _.get(user2, 'result.content.handle')
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    firstName,
    lastName,
    photoURL,
    createdAt: message.timestamp,
    location,
    handle,
    type,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Process contest submission message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processContestSubmission (message) {
  if (!_.includes(['submission.notification.create', 'submission.notification.update',
    'submission.notification.delete'], message.topic)) {
    return false
  }
  const type = _.get(message, 'payload.type', '').toUpperCase()
  if (type !== 'CONTEST SUBMISSION') {
    return false
  }
  const resource = _.get(message, 'payload.resource', '').toUpperCase()
  if (resource !== 'SUBMISSION') {
    return false
  }

  const challengeId = message.payload.challengeId

  // matched
  logger.info('It is contest submission message.')
  // get m2m token
  const token = await helper.getM2Mtoken()
  // get challenge details
  const challenge = await helper.getChallengeDetails(challengeId, token)
  const challengeName = _.get(challenge, 'result.content.challengeName', '')
  const challengeType = _.get(challenge, 'result.content.challengeType', '')
  const challengePrizes = _.get(challenge, 'result.content.prize', [])
  const projectId = _.get(challenge, 'result.content.projectId')

  // get user details
  const user = await helper.getUserDetails(message.payload.memberId, token)
  const user2 = await helper.getUserDetailsByHandle(_.get(user, 'result.content[0].handle'))
  const firstName = _.get(user, 'result.content[0].firstName', '')
  const lastName = _.get(user, 'result.content[0].lastName', '')
  const photoURL = _.get(user2, 'result.content.photoURL', '')
  const location = _.get(user2, 'result.content.homeCountryCode')
  const handle = _.get(user2, 'result.content.handle')
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    firstName,
    lastName,
    photoURL,
    createdAt: message.timestamp,
    location,
    handle,
    type,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Process auto pilot event message. Returns whether the message is successfully handled.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function processAutoPilotEvent (message) {
  if (message.topic !== 'notifications.autopilot.events') {
    return false
  }
  const challengeId = _.get(message, 'payload.projectId')
  if (!challengeId) {
    return false
  }

  // matched
  logger.info('It is auto pilot event message.')
  // get challenge details
  const challenge = await helper.getChallengeDetails(challengeId)
  const challengeName = _.get(challenge, 'result.content.challengeName', '')
  const challengeType = _.get(challenge, 'result.content.challengeType', '')
  const challengePrizes = _.get(challenge, 'result.content.prize', [])
  const projectId = _.get(challenge, 'result.content.projectId')
  const event = {
    topic: message.topic,
    challengeName,
    challengeType,
    challengePrizes,
    createdAt: message.timestamp,
    phaseTypeName: message.payload.phaseTypeName,
    phaseState: message.payload.state,
    projectId,
    challengeId
  }
  await helper.cacheEvent(event)
  return true
}

/**
 * Handle Kafka message. Returns whether the message is successfully handled. If message is not handled, then it is ignored.
 * @param {Object} message the Kafka message in JSON format
 * @returns {Boolean} whether the message is successfully handled
 */
async function handle (message) {
  // log message
  logger.info(`Kafka message: ${JSON.stringify(message, null, 4)}`)
  // loop through processors, find one that can handle the message
  const processors = [processUserRegistration, processAddResource, processUpdateDraftOrActivateChallenge,
    processCloseTask, processContestSubmission, processAutoPilotEvent]
  for (let i = 0; i < processors.length; i += 1) {
    const res = await processors[i](message)
    if (res) {
      // the message is successfully handled by current processor
      return true
    }
  }
  // no processors can handle the message
  logger.info('No processor can recognize and handle the message, it will be ignored.')
  return false
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

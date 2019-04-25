/**
 * Contains generic helper methods
 */
const _ = require('lodash')
const config = require('config')
const m2mAuth = require('tc-core-library-js').auth.m2m
const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME']))
const axios = require('axios')
const Redis = require('ioredis')

const redis = new Redis(config.REDIS_CONNECTION)

/**
 * Function to get M2M token
 * @returns {String} M2M token
 */
async function getM2Mtoken () {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/**
 * Function to get challenge details
 * @param {String|Number} challengeId the challenge id
 * @param {String} m2mToken the m2m token to call TC API, optional
 * @returns {Object} the challenge details
 */
async function getChallengeDetails (challengeId, m2mToken) {
  if (!challengeId) {
    throw new Error('Missing challenge id')
  }
  // get M2M token to call TC API if not provided
  const token = m2mToken || await getM2Mtoken()
  const url = config.GET_CHALLENGE_DETAILS_URL.replace('{challengeId}', challengeId)
  const result = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true })
  if (result.data.result.status < 200 || result.data.result.status >= 300) {
    throw new Error(`Failed to get challenge details: ${result.data.result.content}`)
  }
  return result.data
}

/**
 * Function to get user details
 * @param {String|Number} memberId the member id
 * @param {String} m2mToken the m2m token to call TC API, optional
 * @returns {Object} the user details
 */
async function getUserDetails (memberId, m2mToken) {
  if (!memberId) {
    throw new Error('Missing user id')
  }
  // get M2M token to call TC API if not provided
  const token = m2mToken || await getM2Mtoken()
  const url = config.GET_USER_DETAILS_URL.replace('{memberId}', memberId)
  const result = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true })
  if (result.data.result.status < 200 || result.data.result.status >= 300) {
    throw new Error(`Failed to get user details: ${result.data.result.content}`)
  }
  return result.data
}

/**
 * Function to get user details by handle
 * @param {String} handle the user handle
 * @returns {Object} the user details
 */
async function getUserDetailsByHandle (handle) {
  if (!handle) {
    throw new Error('Missing user handle')
  }
  // this is public API
  const url = config.GET_USER_DETAILS_BY_HANDLE_URL.replace('{handle}', handle)
  // use validate status = false otherwise will axios reject directly
  const result = await axios.get(url, { validateStatus: () => true })
  if (result.data.result.status < 200 || result.data.result.status >= 300) {
    throw new Error(`Failed to get user details by handle: ${result.data.result.content}`)
  }
  return result.data
}

/**
 * Cache event in Redis.
 * @param {Object} event the event to cache
 */
async function cacheEvent (event) {
  const s = JSON.stringify(event)
  const result = await redis.rpush(config.REDIS_EVENT_LIST_KEY, s)
  if (result > Number(config.MAX_CACHED_EVENTS)) {
    // more than max count, remove the oldest one
    await redis.lpop(config.REDIS_EVENT_LIST_KEY)
  }
}

module.exports = {
  getM2Mtoken,
  getChallengeDetails,
  getUserDetails,
  getUserDetailsByHandle,
  cacheEvent
}

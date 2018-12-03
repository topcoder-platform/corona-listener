/**
 * Contains generic test helper methods
 */
const sinon = require('sinon')
const config = require('config')
const moxios = require('moxios')
require('../src/bootstrap')
const testConfig = require('./testConfig')

/**
 * Wait for configured time.
 * @param time the user input time
 */
async function wait (time) {
  await new Promise((resolve) => setTimeout(() => resolve(), time || testConfig.WAIT_MS))
}

/**
 * The core lib stub function
 */
const coreStub = {
  'tc-core-library-js': {
    auth: {
      m2m: () => ({
        getMachineToken: sinon.stub().resolves('FakeToken')
      })
    }
  }
}

const challengeId = 30049360
const challengeUrl = config.GET_CHALLENGE_DETAILS_URL.replace('{challengeId}', challengeId)
const userId = 23124329
const userDetailsUrl = config.GET_USER_DETAILS_URL.replace('{memberId}', userId)
const testUser = require(`./test_files/userDetails_${userId}.json`)
const handle = testUser.result.content[0].handle
const userDetailsByHandleUrl = config.GET_USER_DETAILS_BY_HANDLE_URL.replace('{handle}', handle)
const notFoundChallengeId = 912345111111
const notFoundUserId = 9923124329
const invalidChallengeId = 'invalid'
const invalidUserId = 'invalid'
const invalidUserHandleId = 'invalidHandle'
const notFoundChallengeUrl = config.GET_CHALLENGE_DETAILS_URL.replace('{challengeId}', notFoundChallengeId)
const invalidChallengeUrl = config.GET_CHALLENGE_DETAILS_URL.replace('{challengeId}', invalidChallengeId)
const notFoundUserDetailsUrl = config.GET_USER_DETAILS_URL.replace('{memberId}', notFoundUserId)
const invalidUserUrl = config.GET_USER_DETAILS_URL.replace('{memberId}', invalidUserId)
const invalidUserHandleUrl = config.GET_USER_DETAILS_URL.replace('{memberId}', invalidUserHandleId)
const invalidChallenge = require(`./test_files/challengeDetails_${invalidChallengeId}.json`)
const invalidUser = require(`./test_files/userDetails_${invalidUserId}.json`)
const invalidUserHandle = require(`./test_files/userDetails_${invalidUserHandleId}.json`)
const invalidHandle = invalidUserHandle.result.content[0].handle
const userDetailsByInvalidHandleUrl = config.GET_USER_DETAILS_BY_HANDLE_URL.replace('{handle}', invalidHandle)
const userDetailsByInvalidHandle = require(`./test_files/userDetailsByHandle_${invalidHandle}.json`)

/**
 * Install moxios to mock response.
 */
function installMoxios () {
  if (testConfig.USE_MOCK) {
    moxios.install()
    moxios.stubRequest(challengeUrl, {
      status: 200,
      response: require(`./test_files/challengeDetails_${challengeId}.json`)
    })
    moxios.stubRequest(notFoundChallengeUrl, {
      status: 404,
      response: require(`./test_files/challengeDetails_${notFoundChallengeId}.json`)
    })
    moxios.stubRequest(invalidChallengeUrl, {
      status: invalidChallenge.result.status,
      response: invalidChallenge
    })
    moxios.stubRequest(invalidUserUrl, {
      status: invalidUser.result.status,
      response: invalidUser
    })
    moxios.stubRequest(invalidUserHandleUrl, {
      status: invalidUserHandle.result.status,
      response: invalidUserHandle
    })
    moxios.stubRequest(userDetailsUrl, {
      status: 200,
      response: testUser
    })
    moxios.stubRequest(notFoundUserDetailsUrl, {
      status: 200,
      response: require(`./test_files/userDetails_${notFoundUserId}.json`)
    })
    moxios.stubRequest(userDetailsByHandleUrl, {
      status: 200,
      response: require(`./test_files/userDetailsByHandle_${handle}.json`)
    })
    moxios.stubRequest(userDetailsByInvalidHandleUrl, {
      status: userDetailsByInvalidHandle.result.status,
      response: userDetailsByInvalidHandle
    })
  }
}

module.exports = {
  wait,
  coreStub,
  challengeId,
  userId,
  notFoundChallengeId,
  notFoundUserId,
  invalidChallengeId,
  invalidUserId,
  invalidUserHandleId,
  installMoxios,
  uninstallMoxios: () => {
    if (testConfig.USE_MOCK) {
      moxios.uninstall()
    }
  }
}

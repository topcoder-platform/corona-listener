/**
 * The test cases for Kafka consumer.
 */
const sinon = require('sinon')
const should = require('should')
const proxyquire = require('proxyquire').noCallThru()
const testConfig = require('./testConfig')
const {
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
  uninstallMoxios
} = require('./testHelper')

describe('Kafka Consumer Tests', () => {
  let consumer
  let service
  let emitStub
  beforeEach(() => {
    installMoxios()
    emitStub.reset()
  })

  afterEach(() => {
    uninstallMoxios()
  })

  before(async () => {
    let helper
    if (testConfig.USE_MOCK) {
      helper = proxyquire('../src/common/helper', coreStub)
    } else {
      helper = require('../src/common/helper')
    }
    service = proxyquire('../src/services/KafkaHandlerService', {
      '../common/helper': helper
    })
    const app = proxyquire('../src/app', {
      './common/helper': helper,
      './services/KafkaHandlerService': service
    })
    consumer = app.kafkaConsumer
    emitStub = sinon.stub(helper, 'cacheEvent')
    // wait for app setup
    await wait()
  })

  after(async () => {
    try {
      await consumer.end()
    } catch (e) {
      // ignore error here
    }
  })

  it('KafkaHandlerService - null message', async () => {
    try {
      await service.handle(null)
      throw new Error('should throw error for null message')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"message" must be an object/)
    }
  })

  it('KafkaHandlerService - invalid message (missing topic)', async () => {
    const testMessage = {
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (missing topic)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"topic" is required/)
    }
  })

  it('KafkaHandlerService - invalid message (empty topic)', async () => {
    const testMessage = {
      topic: '',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (empty topic)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"topic" is not allowed to be empty/)
    }
  })

  it('KafkaHandlerService - invalid message (missing originator)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (missing originator)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"originator" is required/)
    }
  })

  it('KafkaHandlerService - invalid message (invalid originator)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 123,
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid originator)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"originator" must be a string/)
    }
  })

  it('KafkaHandlerService - invalid message (missing timestamp)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (missing timestamp)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"timestamp" is required/)
    }
  })

  it('KafkaHandlerService - invalid message (invalid timestamp)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: 'abc',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid timestamp)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"timestamp" must be a number of milliseconds or valid date string/)
    }
  })

  it('KafkaHandlerService - invalid message (missing mime-type)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (missing mime-type)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"mime-type" is required/)
    }
  })

  it('KafkaHandlerService - invalid message (invalid mime-type)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': {},
      payload: { abc: 123 }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid mime-type)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"mime-type" must be a string/)
    }
  })

  it('KafkaHandlerService - invalid message (null payload)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: null
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (null payload)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"payload" must be an object/)
    }
  })

  it('KafkaHandlerService - invalid message (invalid payload)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: [{ abc: 123 }]
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid payload)')
    } catch (e) {
      e.isJoi.should.be.true()
      e.message.should.match(/"payload" must be an object/)
    }
  })

  it('KafkaHandlerService - handle user registration message successfully', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'USER_REGISTRATION',
        data: {
          challengeId,
          userId
        }
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}_${testMessage.payload.type}.json`))
  })

  it('KafkaHandlerService - handle user registration message(invalid challenge id)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'USER_REGISTRATION',
        data: {
          challengeId: '',
          userId
        }
      }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid challenge id)')
    } catch (e) {
      e.message.should.match(/Missing challenge id/)
    }
  })

  it('KafkaHandlerService - handle user registration message(invalid user id)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'USER_REGISTRATION',
        data: {
          challengeId,
          userId: ''
        }
      }
    }
    try {
      await service.handle(testMessage)
      throw new Error('should throw error for invalid message (invalid user id)')
    } catch (e) {
      e.message.should.match(/Missing user id/)
    }
  })

  it('KafkaHandlerService - handle unmatched message properly', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'other',
        data: {
          challengeId,
          userId
        }
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.false()
    emitStub.calledOnce.should.be.false()
  })

  it('KafkaHandlerService - handle add resource message successfully', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ADD_RESOURCE',
        data: {
          challengeId,
          request: {
            roleId: 14,
            resourceUserId: 23124329,
            phaseId: 0,
            addNotification: true,
            addForumWatch: true,
            checkTerm: false,
            studio: false
          }
        }
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}_${testMessage.payload.type}.json`))
  })

  it('KafkaHandlerService - handle activate challenge message 1 successfully', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ACTIVATE_CHALLENGE',
        data: {
          id: challengeId,
          confidentialityType: null,
          technologies: [],
          subTrack: null,
          name: null,
          reviewType: 'COMMUNITY',
          billingAccountId: 123,
          milestoneId: 1,
          detailedRequirements: null,
          submissionGuidelines: null,
          registrationStartsAt: '2018-01-02T00:11:22.001Z',
          registrationEndsAt: '2018-01-02T00:11:22.001Z',
          checkpointSubmissionStartsAt: null,
          checkpointSubmissionEndsAt: null,
          submissionEndsAt: '2018-01-02T00:11:22.001Z',
          round1Info: null,
          round2Info: null,
          platforms: [],
          numberOfCheckpointPrizes: 0,
          checkpointPrize: 0,
          finalDeliverableTypes: null,
          prizes: [10],
          projectId: 123,
          submissionVisibility: false,
          maxNumOfSubmissions: 0,
          task: null,
          assignees: null,
          failedRegisterUsers: null,
          copilotFee: null,
          copilotId: null,
          codeRepo: null,
          environment: null,
          fixedFee: null,
          percentageFee: null
        }
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}_${testMessage.payload.type}1.json`))
  })

  it('KafkaHandlerService - handle activate challenge message 2 successfully', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ACTIVATE_CHALLENGE',
        data: {
          id: challengeId,
          confidentialityType: null,
          technologies: [],
          subTrack: null,
          name: 'test name',
          reviewType: 'COMMUNITY',
          billingAccountId: 123,
          milestoneId: 1,
          detailedRequirements: null,
          submissionGuidelines: null,
          registrationStartsAt: '2018-01-02T00:11:22.001Z',
          registrationEndsAt: '2018-01-02T00:11:22.001Z',
          checkpointSubmissionStartsAt: null,
          checkpointSubmissionEndsAt: null,
          submissionEndsAt: '2018-01-02T00:11:22.001Z',
          round1Info: null,
          round2Info: null,
          platforms: [],
          numberOfCheckpointPrizes: 0,
          checkpointPrize: 0,
          finalDeliverableTypes: 'test type',
          prizes: [10],
          projectId: 123,
          submissionVisibility: false,
          maxNumOfSubmissions: 0,
          task: null,
          assignees: null,
          failedRegisterUsers: null,
          copilotFee: null,
          copilotId: null,
          codeRepo: null,
          environment: null,
          fixedFee: null,
          percentageFee: null
        }
      }
    }

    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}_${testMessage.payload.type}2.json`))
  })

  it('KafkaHandlerService - handle close task message successfully', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId,
          userId,
          winnerId: 123
        }
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}_${testMessage.payload.type}.json`))
  })

  it('KafkaHandlerService - handle close task message (challenge id not found)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId: notFoundChallengeId,
          userId,
          winnerId: 123
        }
      }
    }
    try {
      await service.handle(testMessage)
      throw new Error('Exception should be thrown')
    } catch (e) {
      // will throw 404 if challenge by id not found
      e.message.should.match(/Failed to get challenge details/)
    }
  })

  it('KafkaHandlerService - handle close task message (user id not found)', async () => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId,
          userId: notFoundUserId,
          winnerId: 123
        }
      }
    }
    try {
      await service.handle(testMessage)
      throw new Error('Exception should be thrown')
    } catch (e) {
      // will not throw 404 if user by id not found
      e.message.should.match(/Missing user handle/)
    }
  })

  it('KafkaHandlerService - handle contest submission message successfully', async () => {
    const testMessage = {
      topic: 'submission.notification.update',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '123lkjsf',
        type: 'Contest Submission',
        url: 'http://demo.com/test',
        memberId: 23124329,
        challengeId,
        created: '2018-01-02T00:11:22.001Z',
        updated: '2018-01-02T00:11:22.001Z',
        createdBy: 'Amith',
        updatedBy: 'Amith',
        submissionPhaseId: 1234,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}.json`))
  })

  it('KafkaHandlerService - handle contest submission message(invalid payload.type)', async () => {
    const testMessage = {
      topic: 'submission.notification.update',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'submission',
        id: '123lkjsf',
        type: 'invalid',
        url: 'http://demo.com/test',
        memberId: 23124329,
        challengeId,
        created: '2018-01-02T00:11:22.001Z',
        updated: '2018-01-02T00:11:22.001Z',
        createdBy: 'Amith',
        updatedBy: 'Amith',
        submissionPhaseId: 1234,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.false()
    emitStub.calledOnce.should.be.false()
  })

  it('KafkaHandlerService - handle contest submission message(invalid payload.resource)', async () => {
    const testMessage = {
      topic: 'submission.notification.update',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        resource: 'invalid',
        id: '123lkjsf',
        type: 'Contest Submission',
        url: 'http://demo.com/test',
        memberId: 23124329,
        challengeId,
        created: '2018-01-02T00:11:22.001Z',
        updated: '2018-01-02T00:11:22.001Z',
        createdBy: 'Amith',
        updatedBy: 'Amith',
        submissionPhaseId: 1234,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.false()
    emitStub.calledOnce.should.be.false()
  })

  it('KafkaHandlerService - handle auto pilot event message successfully', async () => {
    const testMessage = {
      topic: 'notifications.autopilot.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        date: '2018-03-04T11:22:33.111Z',
        projectId: challengeId,
        phaseId: 12,
        phaseTypeName: 'Submission',
        state: 'END',
        operator: '123123'
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.true()
    emitStub.calledOnce.should.be.true()
    const [event] = emitStub.firstCall.args
    delete event.createdAt
    should.deepEqual(event, require(`./test_files/log_${testMessage.topic}.json`))
  })

  it('KafkaHandlerService - handle auto pilot event message(invalid payload.projectId)', async () => {
    const testMessage = {
      topic: 'notifications.autopilot.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        date: '2018-03-04T11:22:33.111Z',
        projectId: '',
        phaseId: 12,
        phaseTypeName: 'Submission',
        state: 'END',
        operator: '123123'
      }
    }
    const handled = await service.handle(testMessage)
    handled.should.be.false()
    emitStub.calledOnce.should.be.false()
  })

  if (testConfig.USE_MOCK) {
    it('KafkaHandlerService - handle invalid message(invalid challenge)', async () => {
      const testMessage = {
        topic: 'challenge.notification.events',
        originator: 'originator',
        timestamp: '2018-01-02T00:00:00',
        'mime-type': 'application/json',
        payload: {
          type: 'USER_REGISTRATION',
          data: {
            challengeId: invalidChallengeId,
            userId
          }
        }
      }
      try {
        await service.handle(testMessage)
        throw new Error('should throw error for invalid message (invalid challenge)')
      } catch (e) {
        e.message.should.match(/Failed to get challenge details/)
      }
    })

    it('KafkaHandlerService - handle invalid message(invalid user)', async () => {
      const testMessage = {
        topic: 'challenge.notification.events',
        originator: 'originator',
        timestamp: '2018-01-02T00:00:00',
        'mime-type': 'application/json',
        payload: {
          type: 'USER_REGISTRATION',
          data: {
            challengeId,
            userId: invalidUserId
          }
        }
      }
      try {
        await service.handle(testMessage)
        throw new Error('should throw error for invalid message (invalid user)')
      } catch (e) {
        e.message.should.match(/Failed to get user details/)
      }
    })

    it('KafkaHandlerService - handle invalid message(invalid user handle)', async () => {
      const testMessage = {
        topic: 'challenge.notification.events',
        originator: 'originator',
        timestamp: '2018-01-02T00:00:00',
        'mime-type': 'application/json',
        payload: {
          type: 'USER_REGISTRATION',
          data: {
            challengeId,
            userId: invalidUserHandleId
          }
        }
      }
      try {
        await service.handle(testMessage)
        throw new Error('should throw error for invalid message (invalid user handle)')
      } catch (e) {
        e.message.should.match(/Failed to get user details by handle/)
      }
    })
  }
})

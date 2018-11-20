/**
 * The test cases for Kafka consumer.
 */
const expect = require('chai').expect
const testHelper = require('./testHelper')
const service = require('../src/services/KafkaHandlerService')
const consumer = require('../src/app').kafkaConsumer

describe('Kafka Consumer Tests', () => {
  before((done) => {
    // wait for app setup
    testHelper.wait().then(done)
  })

  after((done) => {
    consumer
      .end()
      .then(() => done())
      .catch(done)
      // wait for all tests' completion, then stop the process explicitly,
      // because the Kafka consumer will make the process non-stop
      .then(() => testHelper.wait())
      .then(() => process.exit(0))
  })

  it('KafkaHandlerService - null message', (done) => {
    service.handle(null)
      .then(() => done(new Error('should throw error for null message')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (missing topic)', (done) => {
    const testMessage = {
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (missing topic)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (empty topic)', (done) => {
    const testMessage = {
      topic: '',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (empty topic)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (missing originator)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (missing originator)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (invalid originator)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 123,
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (invalid originator)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (missing timestamp)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (missing timestamp)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (invalid timestamp)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: 'abc',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (invalid timestamp)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (missing mime-type)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (missing mime-type)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (invalid mime-type)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': {},
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (invalid mime-type)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (null payload)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: null
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (null payload)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - invalid message (invalid payload)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: [{ abc: 123 }]
    }
    service.handle(testMessage)
      .then(() => done(new Error('should throw error for invalid message (invalid payload)')))
      .catch((e) => {
        expect(e.isJoi).to.equal(true)
        done()
      })
  })

  it('KafkaHandlerService - handle user registration message successfully', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'USER_REGISTRATION',
        data: {
          challengeId: 30049360,
          userId: 23124329
        }
      }
    }
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle unmatched message properly', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'other',
        data: {
          challengeId: 30049360,
          userId: 23124329
        }
      }
    }
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(false)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle add resource message successfully', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ADD_RESOURCE',
        data: {
          challengeId: 30049360,
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
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle activate challenge message 1 successfully', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ACTIVATE_CHALLENGE',
        data: {
          id: 30049360,
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
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle activate challenge message 2 successfully', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'ACTIVATE_CHALLENGE',
        data: {
          id: 30049360,
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
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle close task message successfully', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId: 30049360,
          userId: 23124329,
          winnerId: 123
        }
      }
    }
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle close task message (challenge id not found)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId: 912345111111,
          userId: 23124329,
          winnerId: 123
        }
      }
    }
    service.handle(testMessage)
      .then(() => done(new Error('Exception should be thrown')))
      .catch(() => done())
  })

  it('KafkaHandlerService - handle close task message (user id not found)', (done) => {
    const testMessage = {
      topic: 'challenge.notification.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        type: 'CLOSE_TASK',
        data: {
          challengeId: 30049360,
          userId: 9923124329,
          winnerId: 123
        }
      }
    }
    service.handle(testMessage)
      .then(() => done(new Error('Exception should be thrown')))
      .catch(() => done())
  })

  it('KafkaHandlerService - handle contest submission message successfully', (done) => {
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
        challengeId: 30049360,
        created: '2018-01-02T00:11:22.001Z',
        updated: '2018-01-02T00:11:22.001Z',
        createdBy: 'Amith',
        updatedBy: 'Amith',
        submissionPhaseId: 1234,
        fileType: 'zip',
        isFileSubmission: false
      }
    }
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })

  it('KafkaHandlerService - handle auto pilot event message successfully', (done) => {
    const testMessage = {
      topic: 'notifications.autopilot.events',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: {
        date: '2018-03-04T11:22:33.111Z',
        projectId: 30049360,
        phaseId: 12,
        phaseTypeName: 'Submission',
        state: 'END',
        operator: '123123'
      }
    }
    service.handle(testMessage)
      .then((handled) => {
        expect(handled).to.equal(true)
        done()
      })
      .catch((e) => done(e))
  })
})

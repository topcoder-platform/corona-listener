/**
 * The test cases for Kafka consumer.
 */
const expect = require('chai').expect
const testHelper = require('./testHelper')
const testConfig = require('./testConfig')
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

  it('KafkaHandlerService - handle message successfully', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    service.handle(testMessage)
      .then(() => done())
      .catch((e) => done(e))
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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
      topic: testConfig.TEST_TOPIC,
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

  it('Handle valid Kafka message successfully', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the handled message
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (invalid JSON)', (done) => {
    testHelper.sendKafkaMessage('invalid JSON [] {')
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (wrong topic)', (done) => {
    const testMessage = {
      topic: 'wrong',
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (invalid originator)', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: ['originator'],
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (invalid timestamp)', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: 'abc',
      'mime-type': 'application/json',
      payload: { abc: 123 }
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (empty mime-type)', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': '',
      payload: { abc: 123 }
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (missing payload)', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json'
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })

  it('Handle invalid Kafka message (invalid payload)', (done) => {
    const testMessage = {
      topic: testConfig.TEST_TOPIC,
      originator: 'originator',
      timestamp: '2018-01-02T00:00:00',
      'mime-type': 'application/json',
      payload: []
    }
    testHelper.sendKafkaMessage(JSON.stringify(testMessage))
      // wait for app handling the message,
      // check console output to view the error details
      .then(() => testHelper.wait())
      .then(() => done())
      .catch((e) => done(e))
  })
})

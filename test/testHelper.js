/**
 * Contains generic test helper methods
 */
require('../src/bootstrap')
const testConfig = require('./testConfig')
const config = require('config')
const Kafka = require('no-kafka')

let producer

/**
 * Wait for configured time.
 */
async function wait () {
  await new Promise((resolve) => setTimeout(() => resolve(), testConfig.WAIT_MS))
}

/**
 * Send Kafka message
 * @param message the message to send
 */
async function sendKafkaMessage (message) {
  if (!producer) {
    // create Kafka producer
    const options = { connectionString: config.KAFKA_URL }
    if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
      options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
    }
    producer = new Kafka.Producer(options)
    // init producer
    await producer.init()
  }
  // send message
  await producer.send({
    topic: testConfig.TEST_TOPIC,
    message: { value: message }
  })
}

module.exports = {
  wait,
  sendKafkaMessage
}

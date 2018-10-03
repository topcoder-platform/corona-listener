/**
 * The test config parameters.
 */

module.exports = {
  // the time in milliseconds to wait, this is used to wait for some processing completion
  WAIT_MS: (process.env.WAIT_MS && Number(process.env.WAIT_MS)) || 4000,
  // Kafka test topic
  TEST_TOPIC: process.env.TEST_TOPIC || 'test.topic1'
}

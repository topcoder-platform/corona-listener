/**
 * The application entry point
 */
require('./bootstrap')
const config = require('config')
const express = require('express')
const _ = require('lodash')
const cors = require('cors')
const helper = require('./common/helper')
const logger = require('./common/logger')
const Kafka = require('no-kafka')
const KafkaHandlerService = require('./services/KafkaHandlerService')

// start Kafka consumer
logger.info('Start Kafka consumer.')
// create consumer
const options = { connectionString: config.KAFKA_URL }
if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
  options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
}
const consumer = new Kafka.SimpleConsumer(options)

// data handler
const dataHandler = (messageSet, topic, partition) => Promise.each(messageSet, (m) => {
  const message = m.message.value.toString('utf8')
  logger.info(`Handle Kafka event message; Topic: ${topic}; Partition: ${partition}; Offset: ${
    m.offset}; Message: ${message}.`)
  let messageJSON
  try {
    messageJSON = JSON.parse(message)
  } catch (e) {
    logger.error('Invalid message JSON.')
    logger.logFullError(e)
    // ignore the message
    return
  }
  if (messageJSON.topic !== topic) {
    logger.error(`The message topic ${messageJSON.topic} doesn't match the Kafka topic ${topic}.`)
    // ignore the message
    return
  }
  return KafkaHandlerService.handle(messageJSON)
    // commit offset
    .then(() => consumer.commitOffset({ topic, partition, offset: m.offset }))
    .catch((err) => logger.logFullError(err))
})

consumer
  .init()
  // consume configured topics
  .then(() => _.each(config.TOPICS, (tp) => {
    consumer.subscribe(tp, { time: Kafka.LATEST_OFFSET }, dataHandler)
  }))
  .catch((err) => logger.logFullError(err))

// setup express app
const app = express()
app.set('port', config.PORT)

app.use(cors())

const apiRouter = express.Router()

// load all routes
_.each(require('./routes'), (verbs, url) => {
  _.each(verbs, (def, verb) => {
    const actions = []
    const method = require('./controllers/' + def.controller)[def.method]
    if (!method) {
      throw new Error(def.method + ' is undefined')
    }
    actions.push((req, res, next) => {
      req.signature = `${def.controller}#${def.method}`
      next()
    })
    actions.push(method)
    apiRouter[verb](url, helper.autoWrapExpress(actions))
  })
})

app.use('/', apiRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'route not found' })
})

app.use((err, req, res, next) => { // eslint-disable-line
  logger.logFullError(err, req.signature)
  let status = err.httpStatus || 500
  if (err.isJoi) {
    status = 400
  }
  res.status(status)
  if (err.isJoi) {
    res.json({
      error: 'Validation failed',
      details: err.details
    })
  } else {
    res.json({
      error: err.message
    })
  }
})

if (!module.parent) {
  app.listen(app.get('port'), () => {
    logger.info(`Express server listening on port ${app.get('port')}`)
  })
}

module.exports = {
  kafkaConsumer: consumer,
  expressApp: app
}

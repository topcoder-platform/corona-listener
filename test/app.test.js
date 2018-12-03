/**
 * The test cases for express.
 */
const should = require('should')
const proxyquire = require('proxyquire').noCallThru()
const config = require('config')
const Kafka = require('no-kafka')
const puppeteer = require('puppeteer')
const {
  wait,
  coreStub,
  installMoxios,
  uninstallMoxios
} = require('./testHelper')
const testConfig = require('./testConfig')
const port = testConfig.TEST_PORT
const logger = require('../src/common/logger')
const options = { connectionString: config.KAFKA_URL }
if (config.KAFKA_CLIENT_CERT && config.KAFKA_CLIENT_CERT_KEY) {
  options.ssl = { cert: config.KAFKA_CLIENT_CERT, key: config.KAFKA_CLIENT_CERT_KEY }
}
const producer = new Kafka.Producer(options)

describe('Express App Tests', () => {
  let browser
  let page
  let server
  let app
  let consumer
  let logs = []
  const error = logger.error
  const errorLogs = []
  const waitError = async () => {
    while (true) {
      if (errorLogs.length > 0) {
        break
      }
      // use small time to wait
      await wait(1000)
    }
  }

  before(async () => {
    let helper
    if (testConfig.USE_MOCK) {
      helper = proxyquire('../src/common/helper', coreStub)
    } else {
      helper = require('../src/common/helper')
    }
    const service = proxyquire('../src/services/KafkaHandlerService', {
      '../common/helper': helper
    })
    const mainApp = proxyquire('../src/app', {
      './common/helper': helper,
      './services/KafkaHandlerService': service
    })
    app = mainApp.expressApp
    consumer = mainApp.kafkaConsumer
    logger.error = (message) => {
      errorLogs.push(message)
      if (!config.DISABLE_LOGGING) {
        error(message)
      }
    }
    // start kafka producer
    await producer.init()
    server = app.listen(port)
    browser = await puppeteer.launch()
  })

  beforeEach(async () => {
    installMoxios()
    logs = []
    page = await browser.newPage()
    page.on('console', msg => {
      try {
        logs.push(JSON.parse(msg.text()))
      } catch (e) {
        logs.push(msg.text())
      }
    })
  })

  afterEach(async () => {
    uninstallMoxios()
    await page.close()
  })

  after(async () => {
    try {
      await producer.end()
    } catch (e) {
      // ignore
    }
    try {
      await consumer.end()
    } catch (e) {
      // ignore
      console.log(e)
    }
    server.close()
    await browser.close()
  })

  it('should call sample api successfully', async () => {
    await page.goto(`http://localhost:${port}/api`)
    const body = await page.evaluate(() => document.body.innerText)
    should.equal(body, 'Hello World')
  })

  it('should process message and get socket.io events successfully', async () => {
    await page.goto(`http://localhost:${port}`)
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
    await producer.send({
      topic: testMessage.topic,
      message: {
        value: JSON.stringify(testMessage)
      }
    })
    // disable timeout because may process with long time
    await page.waitFor('.mat-list-item-content', { timeout: 0 })
    const event = require('./test_files/log_challenge.notification.events_USER_REGISTRATION.json')
    logs.should.containEql(event)
    // will render ui elements using value from log event data
    const log = await page.$eval('.mat-list-item-content', c => c.innerHTML)
    for (let val of Object.values(event)) {
      log.includes(val).should.be.true()
    }
  })

  it('should process invalid message(invalid json) properly', async () => {
    await page.goto(`http://localhost:${port}`)
    await producer.send({
      topic: 'challenge.notification.events',
      message: {
        value: 'NaN'
      }
    })
    await waitError()
    errorLogs.should.containEql('Invalid message JSON.')
  })

  it('should use routes of web page successfully', async () => {
    // go to home page
    await page.goto(`http://localhost:${port}`)
    await page.waitFor('h1')
    const heading = await page.$eval('h1', heading => heading.innerText)
    should.equal(heading, 'Welcome to Sample Web Page!')
    // click routes links using angular route module
    await page.waitFor('.mat-tab-link')
    const tab1 = await page.$('a.mat-tab-link:nth-child(1)')
    await tab1.click()
    await page.waitFor('p')
    const route1 = await page.$eval('p', p => p.innerText)
    // check body and url for route1
    should.equal(route1, 'This is Route1')
    should.equal(page.url(), `http://localhost:${port}/route1`)
    const tab2 = await page.$('a.mat-tab-link:nth-child(2)')
    await tab2.click()
    await page.waitFor('p')
    const route2 = await page.$eval('p', p => p.innerText)
    // check body and url for route2
    should.equal(route2, 'This is Route2')
    should.equal(page.url(), `http://localhost:${port}/route2`)
  })
})

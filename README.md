# Corona Listener

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- Kafka (v2)

## Configuration

Configuration for the notification server is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- DISABLE_LOGGING: whether to disable logging
- LOG_LEVEL: the log level
- PORT: the server port
- KAFKA_URL: comma separated Kafka hosts
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- TOPICS: Kafka topics to listen to

Test config is at `test/testConfig.js`, you don't need to change it.
The following test parameters can be set in test config files or in env variables:

- WAIT_MS: the time in milliseconds to wait for some processing completion
- TEST_TOPIC: Kafka test topic

## Local Kafka setup

- `http://kafka.apache.org/quickstart` contains details to setup and manage Kafka server,
  below provides details to setup Kafka server in Mac, Windows will use bat commands in bin/windows instead
- download kafka at `http://kafka.apache.org/downloads`
- extract out the doanlowded file
- go to extracted directory
- start ZooKeeper server:
  `bin/zookeeper-server-start.sh config/zookeeper.properties`
- use another terminal, go to same directory, start the Kafka server:
  `bin/kafka-server-start.sh config/server.properties`
- note that the zookeeper server is at localhost:2181, and Kafka server is at localhost:9092
- use another terminal, go to same directory, create some topics:
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test.topic1`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test.topic2`
- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics

## Local deployment

- setup Kafka as above
- install dependencies `npm i`
- run code lint check `npm run lint`
- run code lint fix `npm run lint:fix`
- run tests `npm run test`
- run tests with coverage `npm run cov`
- start app `npm start`,
  the app is running at `http://localhost:3000`,
  it also starts Kafka consumer to listen to configured topics

## Heroku Deployment

- git init
- git add .
- git commit -m init
- heroku create
- heroku config:set KAFKA_URL=... TOPICS=topic1,topic2
- git push heroku master

## Verification

- setup Kafka as above
- see above for details to run tests
- start app
- use the Postman collection and environment in docs folder to test sample API

- to do manual verification for Kafka consumer, go to the Kafka folder
- run Kafka producer and then type a few messages into the console to send to the Kafka server:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test.topic1`
  in the console, write some messages, one per line:
  `{ "topic": "test.topic1", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "key1": "value1" } }`
  `{ "topic": "test.topic1", "originator": "test-originator", "timestamp": "2018-09-26T00:00:00", "mime-type": "application/json", "payload": { "key2": "value2" } }`
- watch the app console output, the handled messages should be shown
- in the Kafka producer, write some invalid messages:
  `invalid message`
  `{ "topic": "test.topic1", "originator": "test-originator", "timestamp": "abc", "mime-type": "application/json", "payload": { "key1": "value1" } }`
  `{ "topic": "test.topic1", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json" }`
- watch the app console output, errors shown be shown

## Notes

- though not required, unit test and Postman test for the sample API are provided

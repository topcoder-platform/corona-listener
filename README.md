# Corona Listener

## Dependencies

- [nodejs](https://nodejs.org/en/) (v10)
- Kafka (v2)
- [socket.io](https://socket.io/)(websocket server)
- [puppeteer](https://github.com/GoogleChrome/puppeteer)(test ui built by Angular)

## Configuration

Configuration for the notification server is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- DISABLE_LOGGING: whether to disable logging
- LOG_LEVEL: the log level
- LOG_EVENT: the log event name used by socket.io server
- PORT: the server port
- KAFKA_URL: comma separated Kafka hosts
- KAFKA_CLIENT_CERT: Kafka connection certificate, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to certificate file or certificate content
- KAFKA_CLIENT_CERT_KEY: Kafka connection private key, optional;
    if not provided, then SSL connection is not used, direct insecure connection is used;
    if provided, it can be either path to private key file or private key content
- TOPICS: Kafka topics to listen to
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- GET_CHALLENGE_DETAILS_URL: URL to get challenge details
- GET_USER_DETAILS_URL: URL to get user details
- GET_USER_DETAILS_BY_HANDLE_URL: URL to get user details by handle

Test config is at `test/testConfig.js`, you don't need to change it.
The following test parameters can be set in test config files or in env variables:

- WAIT_MS: the time in milliseconds to wait for some processing completion
- USE_MOCK: flag to use mock requests in tests to avoid server issues with real apis and make tests to run faster
- TEST_PORT: the server port used in test

Set the following environment variables so that the app can get TC M2M token (use 'set' instead of 'export' for Windows OS):

```bash
export AUTH0_CLIENT_ID=8QovDh27SrDu1XSs68m21A1NBP8isvOt
export AUTH0_CLIENT_SECRET=3QVxxu20QnagdH-McWhVz0WfsQzA1F8taDdGDI4XphgpEYZPcMTF4lX3aeOIeCzh
export AUTH0_URL=https://topcoder-dev.auth0.com/oauth/token
export AUTH0_AUDIENCE=https://m2m.topcoder-dev.com/
```

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
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic challenge.notification.events`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.create`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.update`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic submission.notification.delete`
  `bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic notifications.autopilot.events`
- verify that the topics are created:
  `bin/kafka-topics.sh --list --zookeeper localhost:2181`,
  it should list out the created topics

## Local deployment

Currently web pages using Angular are under ui folder and npm scripts will download dependencies and build asserts automatically.
You may change `USE_MOCK` with `true` at `test/testConfig.js` to run tests with mock response to have faster speed or change `USE_MOCK` with `false` to run tests with real api server.

- setup Kafka as above
- install dependencies `npm i`
- run code lint check `npm run lint`
- run code lint fix `npm run lint:fix`
- run ui code lint check `npm run lint:ui`
- run tests `npm run test`
- run tests with coverage `npm run cov` and you can check coverage report in `coverage` folder
- start app `npm start`,
  the app is running at `http://localhost:3000`,
  it also starts Kafka consumer to listen to configured topics

## Heroku Deployment

You may no need to run `git init` if already git repo.

- git init
- git add .
- git commit -m init
- heroku create
- heroku config:set KAFKA_URL=... TOPICS=topic1,topic2
- git push heroku HEAD:master

## Verification

- setup Kafka as above
- see above for details to run tests
- start app
- use the Postman collection and environment in docs folder to test sample API
- open web page using browser that supports websocket for example open `http://localhost:3000/` using latest Chrome
- to do manual verification for Kafka consumer, go to the Kafka folder
- run Kafka producer for topic `challenge.notification.events`:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic challenge.notification.events`

- input message of user registration to producer:
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "type": "USER_REGISTRATION", "data": { "challengeId": 30049360, "userId": 23124329 } } }`
- watch the app console output, below is shown:

```bash
info: It is user registration (unregistration) message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "challenge.notification.events",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ],
    "firstName": "F_NAME",
    "lastName": "L_NAME",
    "photoURL": "https://www.topcoder.com/i/m/callmekatootie.jpeg"
}
```

- input message of add resource to producer:
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "type": "ADD_RESOURCE", "data": { "challengeId": 30049360, "request": { "roleId": 14, "resourceUserId": 23124329, "phaseId": 0, "addNotification": true, "addForumWatch": true, "checkTerm": false, "studio": false } } } }`
- watch the app console output, below is shown:

```bash
info: It is add resource message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "challenge.notification.events",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ],
    "firstName": "F_NAME",
    "lastName": "L_NAME",
    "photoURL": "https://www.topcoder.com/i/m/callmekatootie.jpeg"
}
```

- input message of update draft challenge to producer:
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "type": "UPDATE_DRAFT_CHALLENGE", "data": { "id": 30049360, "confidentialityType": null, "technologies": [], "subTrack": null, "name": null, "reviewType": "COMMUNITY", "billingAccountId": 80000632, "milestoneId": 1, "prizes": [10], "projectId": 18693 }, "userId": 22838965 } }`
- watch the app console output, below is shown:

```bash
info: It is update draft or activate challenge message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "challenge.notification.events",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ]
}
```

- input message of active challenge to producer:
  `{"topic":"challenge.notification.events","originator":"originator","timestamp":"2018-01-02T00:00:00","mime-type":"application/json","payload":{"type":"ACTIVATE_CHALLENGE","data":{"id":30049360,"confidentialityType":null,"technologies":[],"subTrack":null,"name":"test name","reviewType":"COMMUNITY","billingAccountId":123,"milestoneId":1,"detailedRequirements":null,"submissionGuidelines":null,"registrationStartsAt":"2018-01-02T00:11:22.001Z","registrationEndsAt":"2018-01-02T00:11:22.001Z","checkpointSubmissionStartsAt":null,"checkpointSubmissionEndsAt":null,"submissionEndsAt":"2018-01-02T00:11:22.001Z","round1Info":null,"round2Info":null,"platforms":[],"numberOfCheckpointPrizes":0,"checkpointPrize":0,"finalDeliverableTypes":"test type","prizes":[10],"projectId":123,"submissionVisibility":false,"maxNumOfSubmissions":0,"task":null,"assignees":null,"failedRegisterUsers":null,"copilotFee":null,"copilotId":null,"codeRepo":null,"environment":null,"fixedFee":null,"percentageFee":null}}}`
- watch the app console output, below is shown:

```bash
info: It is update draft or activate challenge message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "challenge.notification.events",
    "challengeName": "test name",
    "challengeType": "test type",
    "challengePrizes": [
        10
    ]
}
```

- input message of close task to producer:
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "type": "CLOSE_TASK", "data": { "challengeId": 30049360, "userId": 23124329, "winnerId": 22678451 } } }`
- watch the app console output, below is shown:

```bash
info: It is close task message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "challenge.notification.events",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ],
    "firstName": "F_NAME",
    "lastName": "L_NAME",
    "photoURL": "https://www.topcoder.com/i/m/callmekatootie.jpeg"
}
```

- input message that can not be handled:
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "type": "OTHER", "data": { "challengeId": 30049360, "userId": 23124329, "winnerId": 22678451 } } }`
- watch the app console output, below is shown:

```bash
info: No processor can recognize and handle the message, it will be ignored.
```

- in the Kafka producer, write some invalid messages:
  `invalid message [{`
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "abc", "mime-type": "application/json", "payload": { "key1": "value1" } }`
  `{ "topic": "challenge.notification.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json" }`
- watch the app console output, errors details are shown

- run another Kafka producer for another topic `submission.notification.create`:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic submission.notification.create`

- input message of contest submission to producer:
  `{ "topic": "submission.notification.create", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "resource": "submission", "id": "slkdf", "type": "Contest Submission", "url": "http://demo.com", "memberId": 23124329, "challengeId": 30049360, "created": "2018-01-02T00:11:22.000Z", "updated": "2018-01-02T00:11:22.000Z", "createdBy": "Amith", "updatedBy": "Amith", "submissionPhaseId": 961198, "fileType": "zip", "isFileSubmission": false } }`
- watch the app console output, below is shown:

```bash
info: It is contest submission message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "submission.notification.create",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ],
    "firstName": "F_NAME",
    "lastName": "L_NAME",
    "photoURL": "https://www.topcoder.com/i/m/callmekatootie.jpeg"
}
```

- run another Kafka producer for another topic `notifications.autopilot.events`:
  `bin/kafka-console-producer.sh --broker-list localhost:9092 --topic notifications.autopilot.events`

- input message of auto pilot event to producer:
  `{ "topic": "notifications.autopilot.events", "originator": "test-originator", "timestamp": "2018-02-16T00:00:00", "mime-type": "application/json", "payload": { "date": "2018-01-02T00:11:22.000Z", "projectId": 30049360, "phaseId": 953326, "phaseTypeName": "Submission", "state": "END", "operator": "22841596" } }`
- watch the app console output, below is shown:

```bash
info: It is auto pilot event message.
```

- watch the Chrome console output, below is shown:

```bash
{
    "topic": "notifications.autopilot.events",
    "challengeName": "Code Dev-Env Test",
    "challengeType": "Code",
    "challengePrizes": [
        350,
        150
    ]
}
```

You can also see logs shown in console of Chrome will render in home page .

Open web pages `http://localhost:3000/` using latest Chrome, and you can click Route1/Route2 tabs and see routes from Angular route module with urls `http://localhost:3000/route1` and `http://localhost:3000/route2` works.
You can also open API tab to check sample api `http://localhost:3000/api`.

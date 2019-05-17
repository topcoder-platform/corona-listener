/**
 * The configuration file.
 */
module.exports = {
  DISABLE_LOGGING: process.env.DISABLE_LOGGING ? process.env.DISABLE_LOGGING.toLowerCase() === 'true' : false,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

  KAFKA_URL: process.env.KAFKA_URL || 'localhost:9092',
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || 'corona-listener-group',
  // below two params are used for secure Kafka connection, they are optional
  // for the local Kafka, they are not needed
  KAFKA_CLIENT_CERT: process.env.KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY: process.env.KAFKA_CLIENT_CERT_KEY,
  // Kafka topics to listen to
  TOPICS: (process.env.TOPICS && process.env.TOPICS.split(',')) || [
    'challenge.notification.events',
    'submission.notification.create',
    'submission.notification.update',
    'submission.notification.delete',
    'notifications.autopilot.events'
  ],

  // corona topic to send event result to
  CORONA_TOPIC: process.env.CORONA_TOPIC || 'corona.saturate.create',

  // Auth0 config params
  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'e6oZAxnoFvjdRtjJs1Jt3tquLnNSTs0e',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ||
    'OGCzOnQkhYTQpZM3NI0sD--JJ_EPcm2E7707_k6zX11m223LrRK1-QZL4Pon4y-D',

  // Challenge & User API url
  GET_CHALLENGE_DETAILS_URL: process.env.GET_CHALLENGE_DETAILS_URL ||
    'https://api.topcoder-dev.com/v3/challenges/{challengeId}',
  GET_USER_DETAILS_URL: process.env.GET_USER_DETAILS_URL ||
    'https://api.topcoder-dev.com/v3/users?filter=id={memberId}',
  GET_USER_DETAILS_BY_HANDLE_URL: process.env.GET_USER_DETAILS_BY_HANDLE_URL ||
    'https://api.topcoder-dev.com/v3/members/{handle}',

  // bus API config params
  BUSAPI_URL: process.env.BUSAPI_URL || 'https://api.topcoder-dev.com/v5',
  KAFKA_ERROR_TOPIC: process.env.KAFKA_ERROR_TOPIC || 'common.error.reporting'

}

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

  AUTH0_URL: process.env.AUTH0_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://www.topcoder.com',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,

  GET_CHALLENGE_DETAILS_URL: process.env.GET_CHALLENGE_DETAILS_URL ||
    'https://api.topcoder-dev.com/v3/challenges/{challengeId}',
  GET_USER_DETAILS_URL: process.env.GET_USER_DETAILS_URL ||
    'https://api.topcoder-dev.com/v3/users?filter=id={memberId}',
  GET_USER_DETAILS_BY_HANDLE_URL: process.env.GET_USER_DETAILS_BY_HANDLE_URL ||
    'https://api.topcoder-dev.com/v3/members/{handle}',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_EVENT_LIST_KEY: process.env.REDIS_EVENT_LIST_KEY || 'events',
  MAX_CACHED_EVENTS: process.env.MAX_CACHED_EVENTS || 10
}

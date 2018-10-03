/**
 * The application API routes
 */

module.exports = {
  '/': {
    get: {
      controller: 'SampleController',
      method: 'getMessage'
    }
  }
}

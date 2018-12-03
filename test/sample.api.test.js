/**
 * The test cases for sample API.
 */
const should = require('should')
const request = require('supertest')
const app = require('../src/app').expressApp

describe('Sample API Tests', () => {
  it('get welcome message successfully', async () => {
    const res = await request(app).get('/api').expect(200)
    should.equal(res.text, 'Hello World')
  })
})

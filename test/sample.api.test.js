/**
 * The test cases for sample API.
 */
const expect = require('chai').expect
let request = require('supertest')
const app = require('../src/app').expressApp

request = request(app)

describe('Sample API Tests', () => {
  it('get welcome message successfully', (done) => {
    request.get('/')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }
        expect(res.text).to.equal('Hello World')
        return done()
      })
  })
})

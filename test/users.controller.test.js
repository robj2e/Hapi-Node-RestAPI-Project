'use strict'

const test = require('ava').test
const proxyquire = require('proxyquire')
const sinon = require('sinon')

test.beforeEach(t => {
  t.context.User = {
    find: sinon.stub().returns({
      exec: sinon.stub()
    }),
    create: sinon.stub()
  }
  t.context.bcrypt = {
    hash: sinon.stub()
  }
  t.context.controller = proxyquire
    .noCallThru()
    .load('../src/controllers/user', {
      '../models/user': t.context.User,
      'bcrypt': t.context.bcrypt
    })
})

test('During user signup, returns an error 409 if e-mail address already found', async t => {
  // Arrange
  t.context.User.find().exec.resolves([1])

  const request = {
    payload: {
      'email': 'rob222eeee@gmail.com', 'password': 'testpassword'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }

  const expected = {message: 'email address already exists'}

  // Act
  await t.context.controller.userSignup(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('userSignup function Returns 200 code for successful user signup', async t => {
  // Arrange
  t.context.User.find().exec.resolves([])
  t.context.User.create.resolves({})
  t.context.bcrypt.hash.resolves('foo')

  const request = {
    payload: {
      email: 'rob@rob2e.com',
      password: 'tshirt'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }

  const expected = {message: 'User created'}
  // Act
  await t.context.controller.userSignup(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('During user signup, returns an error 501 if problem occurs during this process', async t => {
  // Arrange
  t.context.User.find().exec.throws('Error', ['Internal server error'])

  const request = {
    payload: {
      email: 'rob@rob2e.com',
      password: 'tshirt'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }

  const expected = {error: 'Internal server error'}

  // Act
  await t.context.controller.userSignup(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('During user signin, returns an unauthorised error 401 if e-mail address not found', async t => {
  // Arrange
  t.context.User.find().exec.resolves([])

  const request = {
    payload: {
      'email': 'rob222eeee@gmail.com', 'password': 'testpassword'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }

  const expected = {message: 'Auth Failed'}

  // Act
  await t.context.controller.userLogin(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('During user login, returns an error response 500 if problem occurs during this process', async t => {
  // Arrange
  t.context.User.find().exec.throws('Error', ['Internal server error'])

  const request = {
    payload: {
      email: 'rob@rob2e.com',
      password: 'tshirt'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }

  const expected = {error: 'Internal server error'}

  // Act
  await t.context.controller.userLogin(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

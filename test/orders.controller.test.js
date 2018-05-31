'use strict'

const test = require('ava').test
const proxyquire = require('proxyquire')
const sinon = require('sinon')

test.beforeEach(t => {
  t.context.Order = {
    find: sinon.stub().returns({
      select: sinon.stub().returns({
        populate: sinon.stub().returns({
          exec: sinon.stub()
        })
      })
    }),
    findById: sinon.stub().returns({
      populate: sinon.stub().returns({
        exec: sinon.stub()
      })
    }),
    remove: sinon.stub().returns({
      exec: sinon.stub()
    })
  }
  t.context.Product = {
    findById: sinon.stub()
  }

  t.context.controller = proxyquire
    .noCallThru()
    .load('../src/controllers/orders', {
      '../models/order': t.context.Order,
      '../models/product': t.context.Product
    })
})

test('ordersGetAll function should return a order when successful', async t => {
  // Arrange
  t.context.Order.find().select().populate().exec.resolves([{
    product: 'Test Product',
    quantity: 3,
    _id: '123',
    name: 'Product Name'
  }])

  const expected = {
    'count': 1,
    'orders': [
      {
        'id': '123',
        'product': 'Test Product',
        'quantity': 3,
        'request': {
          'type': 'GET',
          'url': 'http://localhost:8000/orders/123'
        }
      }
    ]
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersGetAll({}, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersGetAll function should return a 500 error when request errors', async t => {
  // Arrange
  t.context.Order.find().select().populate().exec.throws('Error', ['Internal server error'])

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersGetAll({}, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

// ordersCreateOrder function tests //

test('ordersCreateOrder function should return a 404 error when Id not found', async t => {
  // Arrange
  t.context.Product.findById.resolves(null)

  const expected = {message: 'Product not found'}

  const request = {
    payload: {
      productId: 'test'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersCreateOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersCreateOrder function should return a 201 when successful', async t => {
  // Arrange
  const Product = {
    findById: sinon.stub().resolves({})
  }
  t.context.controller = proxyquire
    .noCallThru()
    .load('../src/controllers/orders', {
      // Overriding the controller context setup in the before each loop
      // in order to make the 'Order' dependency a constructor, not an object
      // like in the other test cases i.e. it is used via new Order() rather
      // than accessing methods on it directly, i.e. order.find()
      '../models/order': function Order () {
        this.save = sinon.stub().resolves({
          _id: '123',
          quantity: 123,
          product: 'tshirt'
        })
      },
      '../models/product': Product
    })

  const expected = {
    message: 'Order stored',
    createdOrder: {
      _id: '123',
      product: 'tshirt',
      quantity: 123
    },
    request: {
      type: 'GET',
      url: 'http://localhost:8000/orders/123'
    }
  }

  const request = {
    payload: {
      productId: 'test',
      quantity: 123
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersCreateOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersCreateOrder function should return a 500 error when problem occurs', async t => {
  // Arrange
  t.context.Product.findById.throws('Error', ['Internal server error'])

  const expected = {error: 'Internal server error'}

  const request = {
    payload: {
      productId: 'test'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersCreateOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersGetOrder function should return an error when order number is not found', async t => {
  // Arrange
  t.context.Order.findById().populate().exec.resolves(null)

  const expected = {message: 'Order not found'}

  const request = {
    params: {
      orderId: '123123123'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersGetOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersGetOrder function should return a order by searching with a specific id & status code 200 when successful', async t => {
  // Arrange
  t.context.Order.findById().populate().exec.resolves({
    'quantity': 2,
    '_id': '123123123',
    'product': null,
    '__v': 0
  })

  const request = {
    params: {
      orderId: '123123123'
    }
  }
  const expected = {
    'order': {
      'quantity': 2,
      '_id': '123123123',
      'product': null,
      '__v': 0
    },
    'request': {
      'type': 'GET',
      'url': 'http://localhost:8000/orders'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersGetOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersGetOrder function should return a 500 error when request errors', async t => {
  // Arrange
  t.context.Order.findById().populate().exec.throws('Error', ['Internal server error'])

  const request = {
    params: {
      orderId: '123123123'
    }
  }

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersGetOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersDeleteOrder returns status code of 200 when successful deletion occurs', async t => {
  // Arrange
  t.context.Order.remove().exec.resolves(true)

  const request = {
    params: {
      orderID: '123'
    }
  }

  const expected = {
    message: 'Order deleted',
    request: {
      type: 'POST',
      url: 'http://localhost:8000/orders',
      body: {productId: 'ID', quantity: 'Number'}
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersDeleteOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ordersDeleteOrder returns status code of 500 when error occurs during process', async t => {
  // Arrange
  t.context.Order.remove().exec.throws('Error', ['Internal server error'])

  const request = {
    params: {
      orderID: '123'
    }
  }

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.ordersDeleteOrder(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

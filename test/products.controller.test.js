'use strict'

const test = require('ava').test
const proxyquire = require('proxyquire')
const sinon = require('sinon')

test.beforeEach(t => {
  t.context.Product = {
    find: sinon.stub().returns({
      select: sinon.stub().returns({
        exec: sinon.stub()
      })
    }),
    findById: sinon.stub().returns({
      select: sinon.stub().returns({
        exec: sinon.stub()
      })
    }),
    update: sinon.stub().returns({
      exec: sinon.stub()
    }),
    remove: sinon.stub().returns({
      exec: sinon.stub()
    })
  }
  t.context.controller = proxyquire
    .noCallThru()
    .load('../src/controllers/products', {
      '../models/product': t.context.Product
    })
})

// function productsGetAll tests //

test('ProductsGetAll function should return a product when successful', async t => {
  // Arrange
  t.context.Product.find().select().exec.resolves([{
    name: 'Test Product',
    price: 15.99,
    productImage: 'testimage',
    _id: '123'
  }])

  const expected = {
    count: 1,
    products: [
      {
        name: 'Test Product',
        price: 15.99,
        productImage: 'testimage',
        _id: '123',
        request: {
          type: 'GET',
          url: 'http://localhost:8000/products/123'
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
  await t.context.controller.productsGetAll({}, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('ProductsGetAll function should return an error when unsuccessful', async t => {
  // Arrange
  t.context.Product.find().select().exec.throws('Error', ['Internal server error'])

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsGetAll({}, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

// productsCreateProduct //

// function productsGetProduct tests //

test('productsGetProduct returns sucessful HTML code of 200 when finding product', async t => {
  t.context.Product.findById().select().exec.resolves({
    name: 'Test Product',
    price: 15.99,
    productImage: 'testimage',
    _id: '123'
  })

  const expected = {
    product: {
      name: 'Test Product',
      price: 15.99,
      productImage: 'testimage',
      _id: '123'
    },
    request: {
      type: 'GET',
      url: 'http://localhost:8000/products'
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsGetProduct({
    params: {
      productId: '123'
    }
  }, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('productsGetProduct returns unsucessful HTML code of 404 when no product found', async t => {
  t.context.Product.findById().select().exec.resolves(null)

  const expected = {message: 'No valid entry for ID Provided'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsGetProduct({
    params: {
      productId: '123'
    }
  }, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('productsGetProduct returns 500 HTML code of when it errors', async t => {
  t.context.Product.findById().select().exec.throws('Error', ['Internal server error'])

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsGetProduct({
    params: {
      productId: '123'
    }
  }, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

// function productsUpdateProduct tests //
test('productsUpdateProduct returns status code of 200 when successful update occurs', async t => {
  // Arrange
  t.context.Product.update().exec.resolves(true)

  const expected = {
    message: 'Product updated',
    request: {
      type: 'GET',
      url: 'http://localhost:8000/products/123'
    }
  }
  const request = {
    params: {
      productId: '123'
    },
    payload: [
      {
        'name': 'Harry Potter 123',
        'price': '34.12'
      }
    ]
  }
  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsUpdateProduct(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('productsUpdateProduct returns status code of 500 when error occurs', async t => {
  // Arrange
  t.context.Product.update().exec.throws('Error', ['Internal server error'])

  const expected = {error: 'Internal server error'}
  const request = {
    params: {
      productId: '123'
    },
    payload: [
      {
        'name': 'Harry Potter 123',
        'price': '34.12'
      }
    ]
  }
  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsUpdateProduct(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

// function productsDeleteProduct tests //

test('productsDeleteProduct returns status code of 200 when successful deletion occurs', async t => {
  // Arrange
  t.context.Product.remove().exec.resolves(true)

  const request = {
    params: {
      productId: '123'
    }
  }

  const expected = {
    message: 'Product deleted',
    request: {
      type: 'POST',
      url: 'https://localhost:8000/products',
      body: {name: 'String', price: 'Number'}
    }
  }

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsDeleteProduct(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

test('productsDeleteProduct returns status code of 500 when error occurs during process', async t => {
  // Arrange
  t.context.Product.remove().exec.throws('Error', ['Internal server error'])

  const request = {
    params: {
      productId: '123'
    }
  }

  const expected = {error: 'Internal server error'}

  const h = {
    response: sinon.stub().returns({
      code: sinon.stub()
    })
  }
  // Act
  await t.context.controller.productsDeleteProduct(request, h)
  // Assert
  t.true(h.response.calledWith(expected))
})

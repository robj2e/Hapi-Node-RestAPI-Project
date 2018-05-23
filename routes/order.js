const Order = require('../models/order')
const Product = require('../models/product')
const mongoose = require('mongoose')

module.exports = [
  {
    method: 'GET',
    path: '/orders',
    handler: async (request, h) => {
      try {
        const docs = await Order.find()
          .select('product quantity _id')
          .populate('product', 'name')
          .exec()

        const response = {
          count: docs.length,
          orders: docs.map(doc => {
            return {
              id: doc._id,
              product: doc.product,
              quantity: doc.quantity,
              request: {
                type: 'GET',
                url: 'http://localhost:8000/orders/' + doc._id
              }
            }
          })
        }
        return h.response(response).code(200)
      } catch (err) {
        const error = {
          error: err.message
        }
        return h.response(error).code(500)
      }
    }
  },
  {
    method: 'POST',
    path: '/orders',
    handler: async (request, h) => {
      try {
        const product = await Product.findById(request.payload.productId)
        if (!product) {
          return h.response({message: 'Product not found'}).code(404)
        }
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          quantity: request.payload.quantity,
          product: request.payload.productId
        })
        const result = await order.save()

        const response = {
          message: 'Order stored',
          createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
          },
          request: {
            type: 'GET',
            url: 'http://localhost:8000/orders/' + result._id
          }
        }
        return h.response(response).code(201)
      } catch (err) {
        const error = {
          error: err
        }
        return h.response(error).code(500)
      }
    }
  },
  {
    method: 'GET',
    path: '/orders/{orderId}',
    handler: async (request, h) => {
      try {
        const order = await Order.findById(request.params.orderId)
          .populate('product')
          .exec()

        if (!order) {
          return h.response({message: 'Order not found'}).code(404)
        }
        const response = {
          order: order,
          request: {
            type: 'GET',
            url: 'http://localhost:8000/orders'
          }
        }
        return h.response(response).code(200)
      } catch (err) {
        return h.response({error: err}).code(500)
      }
    }
  },
  {
    method: 'DELETE',
    path: '/orders/{orderID}',
    handler: async (request, h) => {
      try {
        await Order.remove({_id: request.params.orderID}).exec()
        const response = {
          message: 'Order deleted',
          request: {
            type: 'POST',
            url: 'http://localhost:8000/orders',
            body: {productId: 'ID', quantity: 'Number'}
          }
        }
        return h.response(response).code(200)
      } catch (err) {
        return h.response({error: err}).code(500)
      }
    }
  }
]

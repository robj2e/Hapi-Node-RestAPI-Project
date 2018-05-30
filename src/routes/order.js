const OrdersController = require('../controllers/orders')

module.exports = [
  {
    method: 'GET',
    path: '/orders',
    handler: OrdersController.ordersGetAll
  },
  {
    method: 'POST',
    path: '/orders',
    handler: OrdersController.ordersCreateOrder
  },
  {
    method: 'GET',
    path: '/orders/{orderId}',
    handler: OrdersController.ordersGetOrder
  },
  {
    method: 'DELETE',
    path: '/orders/{orderID}',
    handler: OrdersController.ordersDeleteOrder
  }
]

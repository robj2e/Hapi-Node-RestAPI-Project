const ProductsController = require('../controllers/products')

module.exports = [
  {
    method: 'GET',
    path: '/products',
    handler: ProductsController.productsGetAll
  },
  {
    method: 'POST',
    path: '/products',
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },
      handler: ProductsController.productsCreateProduct
    }
  },

  {
    method: 'GET',
    path: '/products/{productId}',
    handler: ProductsController.productsGetProduct
  },

  {
    method: 'PATCH',
    path: '/products/{productId}',
    handler: ProductsController.productsUpdateProduct
  },

  {
    method: 'DELETE',
    path: '/products/{productId}',
    handler: ProductsController.productsDeleteProduct
  }
]

const mongoose = require('mongoose')
const Product = require('../models/product')
const fs = require('fs')

module.exports = {
  productsGetAll,
  productsCreateProduct,
  productsGetProduct,
  productsUpdateProduct,
  productsDeleteProduct
}

async function productsGetAll (request, h) {
  try {
    const docs = await Product
      .find()
      .select('name price _id productImage')
      .exec()
    const response = {
      count: docs.length,
      products: docs.map(doc => {
        return {
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:8000/products/' + doc._id
          }
        }
      })
    }
    return h.response(response).code(200)
  } catch (err) {
    // console.log(err)
    const error = {
      error: err.message
    }
    return h.response(error).code(500)
  }
}

async function productsCreateProduct (request, h) {
  console.log(request.payload)
  const datafile = request.payload
  if (datafile.file) {
    let name = datafile.file.hapi.filename
    let path = '/Users/robj2e/Git/hapi-project/uploads/' + name
    let file = fs.createWriteStream(path)

    file.on('error', (err) => {
      console.log(err)
    })

    datafile.file.pipe(file)

    datafile.file.on('end', () => {
      const ret = {
        filename: datafile.file.hapi.filename,
        headers: datafile.file.hapi.headers
      }
    })
  }

  const product = await new Product({
    _id: new mongoose.Types.ObjectId(),
    name: request.payload.name,
    price: request.payload.price,
    productImage: '/Users/robj2e/Git/hapi-project/uploads' + request.payload.file.hapi.filename
  })
  try {
    const result = await product.save()
    console.log(result)
    const data = {
      message: 'Created product successfully',
      createdProduct: {
        name: result.name,
        price: result.price,
        _id: result._id,
        request: {
          type: 'GET',
          url: 'http://localhost:8000/products/' + result._id
        }
      }
    }
    return h.response(data).code(201)
  } catch (err) {
    // console.log(err)
    const error = {
      error: err.message
    }
    h.response(error).code(500)
  }
}

async function productsGetProduct (request, h) {
  try {
    const id = request.params.productId
    console.log(request.params.productId)
    const doc = await Product.findById(id)
      .select('name price _id productImage')
      .exec()
    if (doc) {
      const response = {
        product: doc,
        request: {
          type: 'GET',
          url: 'http://localhost:8000/products'
        }
      }

      return h.response(response).code(200)
    } else {
      return h.response({message: 'No valid entry for ID Provided'}).code(404)
      // reply.code(404).json({message: 'No valid entry for ID provided'})
    }
  } catch (err) {
    h.response({error: err.message}).code(500)
  }
}

async function productsUpdateProduct (request, h) {
  try {
    const id = request.params.productId
    const updateOps = {}
    for (const ops of request.payload) {
      updateOps[ops.propName] = ops.value
    }
    await Product.update({_id: id}, {$set: updateOps}).exec()

    const response = {
      message: 'Product updated',
      request: {
        type: 'GET',
        url: 'http://localhost:8000/products/' + id
      }
    }

    return h.response(response).code(200)
  } catch (err) {
    // console.log(err)
    return h.response({error: err.message}).code(500)
  }
}

async function productsDeleteProduct (request, h) {
  try {
    const id = request.params.productId
    await Product.remove({ _id: id }).exec()

    const delresponse = {
      message: 'Product deleted',
      request: {
        type: 'POST',
        url: 'https://localhost:8000/products',
        body: {name: 'String', price: 'Number'}
      }
    }

    return h.response(delresponse).code(200)
  } catch (err) {
    // console.log(err)
    return h.response({error: err.message}).code(500)
  }
}

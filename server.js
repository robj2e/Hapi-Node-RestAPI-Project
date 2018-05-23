'use strict'

const Hapi = require('hapi')
const mongoose = require('mongoose')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/order')
const userRoutes = require('./routes/user')

mongoose.Promise = Promise
mongoose.connect(
  process.env.MONGO_URL
)

// Creating server with a host and port
const server = Hapi.server({
  host: 'localhost',
  port: 8000,
  router: {stripTrailingSlash: true}
})

server.route([
  ...productRoutes
])
server.route([
  ...orderRoutes
])
server.route([
  ...userRoutes
])

async function start () {
  try {
    await server.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  console.log('Server running at:', server.info.uri)
}

start()

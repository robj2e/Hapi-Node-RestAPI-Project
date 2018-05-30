const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = {
  userSignup,
  userLogin,
  userDelete
}

async function userSignup (request, h) {
  try {
    let user = await User.find({email: request.payload.email}).exec()
    if (user.length >= 1) {
      return h.response({message: 'email address already exists'}).code(409)
    } else {
      const hash = await bcrypt.hash(request.payload.password, 10)
      let user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: request.payload.email,
        password: hash

      })
      console.log(user)
      await user.save()
      return h.response({message: 'User created'}).code(201)
    }
  } catch (err) {
    console.log(err)
    return h.response({error: err}).code(501)
  }
}

async function userLogin (request, h) {
  try {
    const user = await User.find({email: request.payload.email}).exec()
    if (user.length < 1) {
      return h.response({message: 'Auth Failed'}).code(401)
    }

    const result = bcrypt.compare(request.payload.password, user[0].password)
    if (result) {
      const token = jwt.sign({
        email: user[0].email,
        userId: user[0]._id
      },
      process.env.JWT_KEY,
      {
        expiresIn: '1h'
      }
      )
      return h.response({message: 'Auth Successful', token: token}).code(200)
    }
    h.response({message: 'Auth failed'}).code(401)
  } catch (err) {
    console.log(err)
    return h.response({error: err}).code(500)
  }
}

async function userDelete (request, h) {
  try {
    await User.remove({_id: request.params.userId})
    return h.response({message: 'User Deleted'}).code(200)
  } catch (err) {
    console.log(err)
    return h.response({error: err}).code(500)
  }
}

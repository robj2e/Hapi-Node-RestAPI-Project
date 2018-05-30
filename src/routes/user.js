const UserController = require('../controllers/user')

module.exports = [
  {
    method: 'POST',
    path: '/user/signup',
    handler: UserController.userSignup
  },
  {
    method: 'POST',
    path: '/user/login',
    handler: UserController.userLogin
  },
  {
    method: 'DELETE',
    path: '/user/{userId}',
    handler: UserController.userDelete
  }
]

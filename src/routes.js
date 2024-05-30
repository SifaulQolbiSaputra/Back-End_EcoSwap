const handlers = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/register',
    handler: handlers.registerHandler,
  },
  {
    method: 'POST',
    path: '/login',
    handler: handlers.loginHandler,
  },
  {
    method: 'GET',
    path: '/user/{id}',
    handler: handlers.getUserHandler,
  },
  {
    method: 'PUT',
    path: '/user/{id}',
    handler: handlers.updateUserHandler,
  },
];

module.exports = routes;

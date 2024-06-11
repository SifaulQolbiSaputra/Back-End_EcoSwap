/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
require('dotenv').config();
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      timeSkewSec: 15,
    },
    validate: (artifacts, request, h) => {
      const { userId, role } = artifacts.decoded.payload;
      return { isValid: true, credentials: { userId, role } };
    },
  });

  server.auth.default('jwt');

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();

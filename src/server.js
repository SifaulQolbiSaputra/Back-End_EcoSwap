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

  // Konfigurasi CORS
  server.ext('onPreResponse', (request, h) => {
    const response = request.response.isBoom ? request.response.output : request.response;
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:9090';
    response.headers['Access-Control-Allow-Headers'] = 'Accept, Content-Type, Authorization, X-Requested-With';
    response.headers['Access-Control-Allow-Credentials'] = 'true';
    return h.continue;
  });

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();

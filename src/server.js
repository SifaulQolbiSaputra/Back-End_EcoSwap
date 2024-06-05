/* eslint-disable no-unused-vars */
const Hapi = require('@hapi/hapi');
// eslint-disable-next-line import/no-extraneous-dependencies
const Jwt = require('@hapi/jwt');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: 'your_jwt_secret',
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

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

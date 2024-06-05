// eslint-disable-next-line import/no-extraneous-dependencies
const Jwt = require('@hapi/jwt');
const db = require('./db');

const validateToken = async (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h.response({
      status: 'fail',
      message: 'No token provided',
      data: null,
    }).code(401);
  }

  const token = authHeader.split(' ')[1];

  // Verifikasi token menggunakan hapi/jwt
  try {
    const decoded = Jwt.token.decode(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);

    if (rows.length === 0) {
      throw new Error('Invalid token');
    }

    request.auth = { credentials: { userId: decoded.user.id } };
    return h.continue;
  } catch (err) {
    return h.response({
      status: 'fail',
      message: 'Invalid token',
      data: null,
    }).code(401);
  }
};

module.exports = { validateToken };

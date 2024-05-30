/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

// Handler untuk registrasi
const registerHandler = async (request, h) => {
  const { username, email, password } = request.payload;

  // Validasi input
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ username, email, password });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  // Cek apakah user sudah ada
  const [rows] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
  if (rows.length > 0) {
    return h.response({
      status: 'fail',
      message: 'User already exists',
      data: null,
    }).code(400);
  }

  // Generate unique ID
  const id = uuidv4();

  // Simpan user tanpa hash password
  await db.query('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [id, username, email, password]);

  return h.response({
    status: 'success',
    message: 'User registered successfully',
    data: { userId: id },
  }).code(201);
};

// Handler untuk login
const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  // Validasi input
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ email, password });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  // Cek apakah user ada
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) {
    return h.response({
      status: 'fail',
      message: 'User not found',
      data: null,
    }).code(400);
  }

  const user = rows[0];

  // Verifikasi password tanpa hash
  if (password !== user.password) {
    return h.response({
      status: 'fail',
      message: 'Invalid password',
      data: null,
    }).code(400);
  }

  // Buat JWT
  const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

  return h.response({
    status: 'success',
    message: 'Login successful',
    data: { token, userId: user.id },
  }).code(200);
};

// Handler untuk mendapatkan informasi user
const getUserHandler = async (request, h) => {
  const { id } = request.params;

  // Validasi ID
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  const { error } = schema.validate({ id });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  // Dapatkan informasi user
  const [rows] = await db.query('SELECT id, username, email, password, created_at FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return h.response({
      status: 'fail',
      message: 'User not found',
      data: null,
    }).code(404);
  }

  const user = rows[0];

  return h.response({
    status: 'success',
    message: 'User retrieved successfully',
    data: user,
  }).code(200);
};

// Handler untuk mengupdate informasi user
const updateUserHandler = async (request, h) => {
  const { id } = request.params;
  const { username, email, password } = request.payload;

  // Validasi input
  const schema = Joi.object({
    username: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6),
  });

  const { error } = schema.validate({ username, email, password });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  // Cek apakah user ada
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length === 0) {
    return h.response({
      status: 'fail',
      message: 'User not found',
      data: null,
    }).code(404);
  }

  // Update informasi user
  const user = rows[0];
  const updatedUsername = username || user.username;
  const updatedEmail = email || user.email;
  const updatedPassword = password || user.password;

  await db.query('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', [updatedUsername, updatedEmail, updatedPassword, id]);

  return h.response({
    status: 'success',
    message: 'User updated successfully',
    data: {
      id, username: updatedUsername, email: updatedEmail, password: updatedPassword,
    },
  }).code(200);
};

module.exports = {
  registerHandler,
  loginHandler,
  getUserHandler,
  updateUserHandler,
};

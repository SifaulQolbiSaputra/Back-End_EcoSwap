/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
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

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Simpan user dengan hashed password
  await db.query('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)', [id, username, email, hashedPassword]);

  // Dapatkan data user yang baru didaftarkan
  const [newUser] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);

  return h.response({
    status: 'success',
    message: 'User registered successfully',
    data: newUser[0],
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

  // Verifikasi password dengan bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return h.response({
      status: 'fail',
      message: 'Invalid password',
      data: null,
    }).code(400);
  }

  // Buat JWT
  const token = jwt.sign({ userId: user.id, role: 'user' }, 'your_jwt_secret', { expiresIn: '1h' });

  // Hapus token lama jika ada
  await db.query('DELETE FROM tokens WHERE user_id = ?', [user.id]);

  // Simpan token baru ke dalam tabel tokens
  const tokenId = uuidv4();
  await db.query('INSERT INTO tokens (id, token, user_id, role) VALUES (?, ?, ?, ?)', [tokenId, token, user.id, 'user']);

  return h.response({
    status: 'success',
    message: 'User login successful',
    data: { token, userId: user.id },
  }).code(200);
};

const logoutHandler = async (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h.response({
      status: 'fail',
      message: 'No token provided',
      data: null,
    }).code(401);
  }

  const token = authHeader.split(' ')[1];

  // Periksa apakah token valid sebelum logout
  const [rows] = await db.query('SELECT * FROM tokens WHERE token = ?', [token]);
  if (rows.length === 0) {
    return h.response({
      status: 'fail',
      message: 'Invalid token',
      data: null,
    }).code(401);
  }

  // Hapus token dari database
  await db.query('DELETE FROM tokens WHERE token = ?', [token]);

  return h.response({
    status: 'success',
    message: 'Logout successful',
    data: null,
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
  const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
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
  const updatedPassword = password ? await bcrypt.hash(password, 10) : user.password;

  await db.query('UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?', [updatedUsername, updatedEmail, updatedPassword, id]);

  return h.response({
    status: 'success',
    message: 'User updated successfully',
    data: {
      id, username: updatedUsername, email: updatedEmail,
    },
  }).code(200);
};

const getAllUsersHandler = async (request, h) => {
  // Dapatkan semua data user
  const [users] = await db.query('SELECT id, username, email, created_at FROM users');

  return h.response({
    status: 'success',
    message: 'Users retrieved successfully',
    data: users,
  }).code(200);
};

const adminLoginHandler = async (request, h) => {
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

  // Cek apakah admin ada
  const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
  if (rows.length === 0) {
    return h.response({
      status: 'fail',
      message: 'Admin not found',
      data: null,
    }).code(400);
  }

  const admin = rows[0];

  // Verifikasi password tanpa hash
  if (password !== admin.password) {
    return h.response({
      status: 'fail',
      message: 'Invalid password',
      data: null,
    }).code(400);
  }

  // Buat JWT
  const token = jwt.sign({ userId: admin.id, role: 'admin' }, 'your_jwt_secret', { expiresIn: '1h' });

  // Hapus token lama jika ada
  await db.query('DELETE FROM tokens WHERE user_id = ? AND role = ?', [admin.id, 'admin']);

  // Simpan token baru ke dalam tabel tokens
  const tokenId = uuidv4();
  await db.query('INSERT INTO tokens (id, token, user_id, role) VALUES (?, ?, ?, ?)', [tokenId, token, admin.id, 'admin']);

  return h.response({
    status: 'success',
    message: 'Admin login successful',
    data: { token, adminId: admin.id },
  }).code(200);
};

const adminLogoutHandler = async (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return h.response({
      status: 'fail',
      message: 'No token provided',
      data: null,
    }).code(401);
  }

  const token = authHeader.split(' ')[1];

  // Hapus token dari database
  await db.query('DELETE FROM tokens WHERE token = ? AND role = ?', [token, 'admin']);

  return h.response({
    status: 'success',
    message: 'Admin logout successful',
    data: null,
  }).code(200);
};

// Handler untuk pengajuan penjemputan sampah
const requestPickupHandler = async (request, h) => {
  const {
    name, address, phone, description,
  } = request.payload;
  const { userId } = request.auth.credentials;

  // Validasi input
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    description: Joi.string().optional(),
  });

  const { error } = schema.validate({
    name, address, phone, description,
  });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  // Generate unique ID
  const id = uuidv4();

  // Simpan data pengajuan penjemputan ke dalam tabel pickups
  await db.query('INSERT INTO pickups (id, user_id, name, address, phone, description) VALUES (?, ?, ?, ?, ?, ?)', [id, userId, name, address, phone, description]);

  return h.response({
    status: 'success',
    message: 'Pickup request submitted successfully',
    data: {
      id, userid: userId, nama: name, alamat: address, noTelpon: phone, status: 'pending',
    },
  }).code(201);
};

// Handler untuk membatalkan pengajuan penjemputan sampah
const cancelPickupHandler = async (request, h) => {
  const { id } = request.params;
  const { userId } = request.auth.credentials;

  try {
    // Cek apakah pengajuan penjemputan ada dan milik user yang sedang login
    const [rows] = await db.query('SELECT * FROM pickups WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Pickup request not found or not authorized',
        data: null,
      }).code(404);
    }

    // Hapus pengajuan penjemputan
    await db.query('DELETE FROM pickups WHERE id = ? AND user_id = ?', [id, userId]);

    return h.response({
      status: 'success',
      message: 'Pickup request canceled successfully',
      data: null,
    }).code(200);
  } catch (error) {
    console.log('Error during pickup cancellation:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

// Handler untuk admin menerima penjemputan user dan mengisi jenis sampah, berat, dan poin
const approvePickupHandler = async (request, h) => {
  const { id } = request.params;
  const { wasteType, weight, points } = request.payload;

  // Validasi input
  const schema = Joi.object({
    wasteType: Joi.string().required(),
    weight: Joi.number().required(),
    points: Joi.number().required(),
  });

  const { error } = schema.validate({ wasteType, weight, points });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  try {
    // Cek apakah pengajuan penjemputan ada
    const [rows] = await db.query('SELECT * FROM pickups WHERE id = ?', [id]);
    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Pickup request not found',
        data: null,
      }).code(404);
    }

    const pickup = rows[0];

    // Update pengajuan penjemputan dengan jenis sampah, berat, dan poin
    await db.query('UPDATE pickups SET waste_type = ?, weight = ?, points = ?, status = ? WHERE id = ?', [wasteType, weight, points, 'approved', id]);

    // Tambahkan poin ke total poin user
    const [userPointsRows] = await db.query('SELECT * FROM user_points WHERE user_id = ?', [pickup.user_id]);
    if (userPointsRows.length === 0) {
      await db.query('INSERT INTO user_points (id, user_id, total_points) VALUES (?, ?, ?)', [uuidv4(), pickup.user_id, points]);
    } else {
      const totalPoints = userPointsRows[0].total_points + points;
      await db.query('UPDATE user_points SET total_points = ? WHERE user_id = ?', [totalPoints, pickup.user_id]);
    }

    return h.response({
      status: 'success',
      message: 'Pickup request approved and points added',
      data: {
        jenissampah: wasteType,
        berat: weight,
        poin: points,
        status: 'approved',
      },
    }).code(200);
  // eslint-disable-next-line no-shadow
  } catch (error) {
    console.log('Error during pickup approval:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};
// Handler untuk mendapatkan total poin user
const getUserPointsHandler = async (request, h) => {
  const { id } = request.params;

  // Validasi input
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

  try {
    // Cek apakah user ada
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'User not found',
        data: null,
      }).code(404);
    }

    // Dapatkan total poin user
    const [pointsRows] = await db.query('SELECT * FROM user_points WHERE user_id = ?', [id]);
    if (pointsRows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'User points not found',
        data: null,
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'User points retrieved successfully',
      data: pointsRows[0],
    }).code(200);
  // eslint-disable-next-line no-shadow
  } catch (error) {
    console.log('Error during retrieving user points:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};
const getPickupsByUserIdHandler = async (request, h) => {
  const { userId } = request.params;

  try {
    const [rows] = await db.query('SELECT * FROM pickups WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Pickups not found for this user',
        data: null,
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Pickups retrieved successfully',
      data: rows,
    }).code(200);
  } catch (error) {
    console.log('Error during retrieving pickups:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const getAllPickupsHandler = async (request, h) => {
  try {
    const [rows] = await db.query('SELECT * FROM pickups');
    return h.response({
      status: 'success',
      message: 'All pickups retrieved successfully',
      data: rows,
    }).code(200);
  } catch (error) {
    console.log('Error during retrieving pickups:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

// Handler untuk user mengajukan penarikan dana
const requestWithdrawalHandler = async (request, h) => {
  const {
    name, email, phone, ewallet, amount,
  } = request.payload;
  const { userId } = request.auth.credentials;

  // Validasi input
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    ewallet: Joi.string().required(),
    amount: Joi.number().integer().min(1).required(),
  });

  const { error } = schema.validate({
    name, email, phone, ewallet, amount,
  });
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
      data: null,
    }).code(400);
  }

  try {
    // Dapatkan total poin user
    const [pointsRows] = await db.query('SELECT total_points FROM user_points WHERE user_id = ?', [userId]);
    if (pointsRows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'User points not found',
        data: null,
      }).code(404);
    }

    const totalPoints = pointsRows[0].total_points;

    // Pastikan jumlah penarikan tidak melebihi total poin
    if (amount > totalPoints) {
      return h.response({
        status: 'fail',
        message: 'Withdrawal amount exceeds total points',
        data: null,
      }).code(400);
    }

    // Tambahkan pengajuan penarikan dana ke dalam database
    await db.query('INSERT INTO withdrawals (id, user_id, name, email, phone, ewallet, amount) VALUES (?, ?, ?, ?, ?, ?, ?)', [uuidv4(), userId, name, email, phone, ewallet, amount]);

    // Dapatkan data pengajuan penarikan yang baru saja dibuat
    const [newWithdrawal] = await db.query('SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);

    return h.response({
      status: 'success',
      message: 'Withdrawal request submitted successfully',
      data: newWithdrawal[0],
    }).code(200);
  // eslint-disable-next-line no-shadow
  } catch (error) {
    console.log('Error during withdrawal request:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const approveWithdrawalHandler = async (request, h) => {
  const { id } = request.params;

  try {
    // Cek apakah pengajuan penarikan ada
    const [rows] = await db.query('SELECT * FROM withdrawals WHERE id = ?', [id]);
    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Withdrawal request not found',
        data: null,
      }).code(404);
    }

    const withdrawal = rows[0];

    // Update status penarikan menjadi 'approved'
    await db.query('UPDATE withdrawals SET status = ? WHERE id = ?', ['approved', id]);

    // Kurangi total poin pengguna
    const [pointsRows] = await db.query('SELECT * FROM user_points WHERE user_id = ?', [withdrawal.user_id]);
    if (pointsRows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'User points not found',
        data: null,
      }).code(404);
    }

    const currentPoints = pointsRows[0].total_points;
    const updatedPoints = currentPoints - withdrawal.amount;

    await db.query('UPDATE user_points SET total_points = ? WHERE user_id = ?', [updatedPoints, withdrawal.user_id]);

    return h.response({
      status: 'success',
      message: 'Withdrawal request approved successfully',
      data: { status: 'approved' },
    }).code(200);
  } catch (error) {
    console.log('Error during approving withdrawal request:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const getAllWithdrawalsHandler = async (request, h) => {
  try {
    // Dapatkan semua pengajuan penarikan dari database
    const [withdrawals] = await db.query('SELECT * FROM withdrawals');

    return h.response({
      status: 'success',
      message: 'All withdrawal requests retrieved successfully',
      data: withdrawals,
    }).code(200);
  } catch (error) {
    console.log('Error during retrieving withdrawal requests:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const getPickupByIdHandler = async (request, h) => {
  const { id } = request.params;

  try {
    const [rows] = await db.query('SELECT * FROM pickups WHERE id = ?', [id]);

    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Pickup not found',
        data: null,
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Pickup found',
      data: rows[0],
    }).code(200);
  } catch (error) {
    console.error('Error fetching pickup:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const getWithdrawalByIdHandler = async (request, h) => {
  const { id } = request.params;

  try {
    const [rows] = await db.query('SELECT * FROM withdrawals WHERE id = ?', [id]);

    if (rows.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Withdrawal not found',
        data: null,
      }).code(404);
    }

    const withdrawal = rows[0];

    return h.response({
      status: 'success',
      message: 'Withdrawal found',
      data: withdrawal,
    }).code(200);
  } catch (error) {
    console.error('Error fetching withdrawal:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};
const getTokensHandler = async (request, h) => {
  try {
    // Dapatkan semua token dari tabel tokens
    const [tokens] = await db.query('SELECT * FROM tokens');

    return h.response({
      status: 'success',
      message: 'Tokens retrieved successfully',
      data: tokens,
    }).code(200);
  } catch (error) {
    console.log('Error during retrieving tokens:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

const getTokensByUserIdHandler = async (request, h) => {
  const { userId } = request.params;

  try {
    // Dapatkan token berdasarkan user ID
    const [tokens] = await db.query('SELECT * FROM tokens WHERE user_id = ?', [userId]);

    return h.response({
      status: 'success',
      message: 'Tokens retrieved successfully',
      data: tokens,
    }).code(200);
  } catch (error) {
    console.log('Error during retrieving tokens:', error.message);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
      data: null,
    }).code(500);
  }
};

module.exports = {
  registerHandler,
  loginHandler,
  getUserHandler,
  updateUserHandler,
  getAllUsersHandler,
  adminLoginHandler,
  logoutHandler,
  adminLogoutHandler,
  requestPickupHandler,
  cancelPickupHandler,
  approvePickupHandler,
  getUserPointsHandler,
  getPickupsByUserIdHandler,
  getAllPickupsHandler,
  requestWithdrawalHandler,
  approveWithdrawalHandler,
  getAllWithdrawalsHandler,
  getPickupByIdHandler,
  getWithdrawalByIdHandler,
  getTokensHandler,
  getTokensByUserIdHandler,
};

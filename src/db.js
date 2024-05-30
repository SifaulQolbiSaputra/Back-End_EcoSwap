// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'sifaul',
  password: '12345',
  database: 'ecoswap',
});

module.exports = pool.promise();

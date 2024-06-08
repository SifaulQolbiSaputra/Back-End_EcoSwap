// eslint-disable-next-line import/no-extraneous-dependencies

// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'GGCZhvFAtPHbqHN.root',
  password: 'cM07jrMC0fp6JXMT',
  database: 'test',
  ssl: {
    rejectUnauthorized: true, // Sesuaikan dengan kebutuhan Anda
  },
});

module.exports = pool.promise();

// eslint-disable-next-line import/no-extraneous-dependencies
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'SG-ecoswap-db-8744-mysql-master.servers.mongodirector.com',
  user: 'sgroot',
  password: 'eVMCmGK#ogtv8fHG',
  database: 'ecoswap-db',
});

module.exports = pool.promise();

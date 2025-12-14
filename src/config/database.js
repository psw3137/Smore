// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smore',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 10000
});

// 연결 테스트 (서버 시작 시에만)
if (require.main === module || process.env.NODE_ENV === 'production') {
  pool.getConnection()
    .then(conn => {
      console.log('✅ MySQL connected successfully');
      conn.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = pool;

// server/db.js
const mysql = require('mysql2/promise')
const pool = mysql.createPool({
 host: 'localhost',
 port: 3306,
 user: 'root',
 password: '', // Laragon default; do NOT do this in production
 database: 'student_records',
 waitForConnections: true,
 connectionLimit: 10,
 queueLimit: 0
})
module.exports = pool
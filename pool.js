const mysql = require('mysql')
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  port: '3306',
  database: 'xiaofeiniu',
  connectionLimit: 5
})

module.exports = pool
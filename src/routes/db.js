require('dotenv').config();
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 3, // 🔥 BAJO para Clever
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  queueLimit: 0,
  acquireTimeout: 10000
});
function connectDb() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log('Error al conectar la base de datos')
      setTimeout(connectDb, 2000)
      return
    }

    console.log('Conectado correctamente a la base de datos')
    connection.release()
  })

}

connectDb()



module.exports = pool;

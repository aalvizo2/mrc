require('dotenv').config();
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || '123456789',
  database: process.env.DB_NAME || 'mrc',
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

require('dotenv').config();
const mysql = require('mysql');





const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


function connectDb() {
  pool.getConnection((err, connection) => {
    if (err) {
      // 🚩 CAMBIA ESTA LÍNEA PARA VER EL ERROR REAL:
      console.log('❌ Error detallado:', err.code, err.sqlMessage);

      setTimeout(connectDb, 2000);
      return;
    }

    console.log('✅ Conectado correctamente a la base de datos');
    connection.release();
  });
}

connectDb()

pool.getConnection((err, connection) => {
  if (err) {
    console.log("❌ ERROR CONEXIÓN:", err);
    return;
  }

});







module.exports = pool;

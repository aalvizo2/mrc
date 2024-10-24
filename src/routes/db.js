require('dotenv').config();
const mysql = require('mysql');

// Crear pool de conexiones a la base de datos
const pool = mysql.createPool({
    connectionLimit: 10, // Ajusta según sea necesario
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Manejar la conexión al pool
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error al obtener conexión del pool: ', err);
        return;
    }
    console.log('Conectado a la base de datos');

    // Libera la conexión al pool después de su uso
    connection.release();

    // Manejar errores en el pool
    pool.on('error', (err) => {
        console.error('Error en el pool de conexiones: ', err)
    });
})

// Exportar el pool para su uso en otras partes de la aplicación
module.exports = pool

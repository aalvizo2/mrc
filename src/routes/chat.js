const express= require('express')
const router= express.Router()
const connection= require('./db')



router.get('/chat-test', (req, res) => {
    const usuario = req.session.usuario || '';
    const esAdmin = req.session.admin; // boolean real
    const adminNombre = req.session.name; // nombre real

    connection.query(
        'SELECT SUM(cantidad) as objeto FROM carrito WHERE usuario=?',
        [usuario],
        (err, objeto) => {

            const contador = objeto[0]?.objeto || 0;

            res.render('chat-test', {
                login: true,
                usuario,
                
                // 🔥 AQUÍ ESTÁ EL TRUCO
                admin: adminNombre,   // 👉 sidebar recibe nombre
                esAdmin: esAdmin,     // 👉 lógica usa boolean
                
                administrador: adminNombre, // por si lo usas en chat
                
                currentPages: 'cart',
                objeto: contador
            });
        }
    );
});


module.exports= router
const express = require('express');
const router = express.Router();

router.get('/chat-test', (req, res) => {
    const usuario = req.session.usuario || '';
    const admin = req.session.admin;
    const administrador = req.session.name

    console.log('usuario:', usuario);
    console.log('admin:', administrador);
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        const contador= objeto[0].objeto
        res.render('chat-test', {
            login: true,
            usuario,
            admin,
            administrador,
            currentPages: 'cart',
            objeto: contador
        });
    })

        
    });

    module.exports = router;
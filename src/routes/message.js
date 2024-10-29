const express= require('express')
const Router= express.Router()
const connection= require('./db')

Router.get('/enviar-mensaje', (req, res) => {
    const { usuario } = req.query;  // El usuario actual
    const receptor = 'mrc';  // Puedes cambiar esto a cualquier receptor deseado

    const query = `
        SELECT * FROM mensajes 
        WHERE (remitente = ? AND receptor = ?) 
        OR (remitente = ? AND receptor = ?) 
        ORDER BY fecha DESC
        
    `;

    connection.query(query, [usuario, receptor, receptor, usuario], (err, Datos) => {
        if (err) throw err;

        console.log(Datos);  // Verifica que los mensajes se están obteniendo correctamente

        res.render('enviar-mensaje', {
            datos: Datos,  // Lista de mensajes entre usuario y receptor
            usuario: usuario
        });
    });
});

Router.post('/sendMessage', (req, res) => {
    console.log(req.body)
    const {
        nombre, 
        mensaje, 
        fecha
    }= req.body
    connection.query('INSERT INTO mensajes (nombre, mensaje, fecha, remitente, receptor) VALUES (?,?,?,?,?)', [nombre, mensaje, fecha, nombre, 'mrc'], (err) => {
        if(err){
            throw err
        }else{
            res.status(200).send({message: 'Operación realizada con éxito'})
        }
    })
})


Router.get('/mensaje_admin', (req, res) => {
    const admin= req.session.name
    if(!admin){
        res.redirect('/login')
    }else{
        connection.query('SELECT * FROM mensajes WHERE remitente != ?', [admin], (err, datos) => {
            if(err){
                throw err
            }else{
                res.render('mensaje_admin', {
                    login: true,
                    admin: admin,
                    datos: datos
                })
            }
        })
        
    }
})

Router.get('/conversacion', (req, res) => {
    const admin= req.session.name
    
    if(!admin){
        res.redirect('/login')
    }
    const{nombre}= req.query

    const query = `
        SELECT * FROM mensajes 
        WHERE (remitente = ? AND receptor = ?)
        OR (remitente = ? AND receptor = ?)
        ORDER BY fecha DESC
    `
    connection.query(query, [nombre, admin, admin, nombre], (err, datos) =>{
        if(err) throw err
        res.render('conversacion', {
            datos: datos,
            admin: admin,
            login: true,
            nombre: nombre
        })
    })
})

Router.post('/reply', (req, res) => {
    const {nombre, mensaje, fecha, usuario}= req.body
    console.log(req.body)
    connection.query('INSERT INTO mensajes(nombre, fecha, mensaje, remitente, receptor) VALUES (?,?,?,?,?)', [nombre, fecha, mensaje, nombre, usuario], (err) =>{
        if(err){
            throw err
        }else{
            res.status(200).send({message: 'Operación realizada con éxito'})
        }
        
    })
})


module.exports= Router
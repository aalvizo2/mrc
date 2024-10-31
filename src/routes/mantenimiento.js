const express= require('express')
const Router= express.Router()
const connection = require('./db')
const { readSync } = require('fs')

Router.get('/mantenimiento', (req, res) =>{
    const usuario= req.session.usuario
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        const contador= objeto[0].objeto
        res.render('mantenimiento', {
            usuario: usuario,
            objeto: contador
        })
    })
    })  
    

Router.post('/enviarDatos', (req, res) => {
    const {nombre, modelo, fecha, descripcion}= req.body
    connection.query('INSERT INTO mantenimiento (nombre, modelo, fecha, descripcion) VALUES (?,?,?,?)', [nombre, modelo, fecha, descripcion], (error) => {
        if (error) {
            res.status(500).send({ message: 'Error al realizar la operación' })
        } else {
            res.status(200).json({ message: 'Operación realizada con éxito' })
            
        }
    })
})



module.exports=Router
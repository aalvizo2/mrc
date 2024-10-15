const express= require('express')
const Router= express.Router()
const connection = require('./db')
const { readSync } = require('fs')

Router.get('/mantenimiento', (req, res) =>{
    const usuario= req.session.usuario
    res.render('mantenimiento', {
        usuario: usuario
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
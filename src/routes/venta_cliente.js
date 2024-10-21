const express= require('express')
const Router= express.Router()
const connection= require('./db')

Router.get('/venta_cliente', (req, res)  => {
    const {usuario} = req.query
    connection.query('SELECT * FROM ventas WHERE usuario=?', [usuario], (err, data) => {
        if(err) throw err 
        console.log(data)
        res.render('venta_cliente', {
            data: data
        })
    })
    
})

module.exports= Router
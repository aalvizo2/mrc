const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')
Router.get('/refacciones', (req, res)=>{
    usuario= req.session.usuario
    connection.query('SELECT * FROM producto WHERE categoria="refacciones"', (err, refacciones)=>{
        connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
            const contador= objeto[0].objeto
            res.render('refacciones', {
                login: true, 
                usuario: usuario, 
                datos: refacciones,
                objeto: contador
             })
        })      
        
    })
})


module.exports= Router
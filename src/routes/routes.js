const express= require('express')
const Router= express.Router()
var login= require('./login')
const connection= require('./db')


Router.get("/", (req, res)=>{
    usuario= req.session.usuario
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        const contador= objeto[0].objeto
    res.render('inicio', {
        login: true, 
        usuario: usuario,
        objeto: contador
    })
})
   
    
})



module.exports= Router
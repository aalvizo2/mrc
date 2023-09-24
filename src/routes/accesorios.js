const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')

//we loading our accesorios page 
Router.get('/accesorios', (req, res)=>{
   usuario= req.session.usuario
   connection.query('SELECT * FROM producto WHERE categoria="accesorios"', (err, rows)=>{
     console.log(rows)
     res.render('accesorios', {
        login: true, 
        usuario: usuario, 
        datos: rows
     })
   })
})

module.exports= Router
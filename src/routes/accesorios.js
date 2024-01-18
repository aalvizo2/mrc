const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')

//we loading our accesorios page 
Router.get('/accesorios', (req, res)=>{
   usuario= req.session.usuario
   connection.query('SELECT * FROM producto WHERE categoria="accesorios"', (err, rows)=>{
     console.log(rows)
     connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      res.render('refacciones', {
          login: true, 
          usuario: usuario, 
          datos: rows,
          objeto: contador
       })
     })
    
   })
})

module.exports= Router
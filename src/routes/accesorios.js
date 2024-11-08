const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const getImageUrl = require('./getImageUrl')



//we loading our accesorios page 
Router.get('/accesorios', (req, res)=>{
   usuario= req.session.usuario
   connection.query('SELECT * FROM producto WHERE categoria="accesorios"', (err, rows)=>{
     
     connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      const imagenes= rows.map(item => item.img_product)
      console.log(imagenes)
     

       Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
       .then((urls) => {
         res.render('accesorios', {
          login: true, 
          usuario: usuario, 
          datos: rows,
          objeto: contador, 
          urls: urls
         })
       })
       
      
      
     })
    
   })
})

module.exports= Router
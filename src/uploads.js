const express= require('express')
const Router= express.Router()
const connection= require('./routes/db')
require('./routes/login')


const fileUpload= require('express-fileupload')
const mysql= require('mysql')


//uploading the following image

Router.get('/producto', (req, res)=>{
  var usuario= req.session.usuario
  var administrador= req.session.admin 
  if(usuario) console.log(usuario)
  if(administrador) console.log(administrador)
  const perPage= 14
  const pagina= req.query.pagina || 1
  const offset= (pagina -1)* perPage
  connection.query('SELECT* FROM producto LIMIT ? OFFSET ? ',[perPage, offset], (err, row)=>{
    console.log(row)
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      
      connection.query('SELECT CEIL(COUNT (*)) AS count FROM producto', (err, conteo)=>{
        const TotalProducts= conteo[0].count
        console.log(conteo)
        const totalPages= Math.ceil(TotalProducts/perPage)
        console.log(totalPages)
        res.render('producto', {
          login: true,
          admin: administrador,
          usuario: usuario,
          datos: row,
          objeto: contador, 
          currentPage: pagina,
          totalPages: totalPages
          

        })
      })    
    })
  })
})
    

  
    
  


 


  module.exports= Router
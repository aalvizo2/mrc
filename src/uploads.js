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
  connection.query('SELECT* FROM producto', (err, row)=>{
    console.log(row)
    res.render('producto', {
      login: true,
      admin: administrador,
      usuario: usuario,
      datos: row
      
    })
  })
    
  })


 


  module.exports= Router
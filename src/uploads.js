const express= require('express')
const Router= express.Router()
const connection= require('./routes/db')
require('./routes/login')


const fileUpload= require('express-fileupload')
const mysql= require('mysql')


//uploading the following image

Router.get('/producto', (req, res)=>{
  const usuario= req.session.usuario
  connection.query('SELECT* FROM producto', (err, row)=>{
    console.log(row)
    res.render('producto', {
      login: true,
      usuario: usuario,
      datos: row
      
    })
  })
    
  })


 


  module.exports= Router
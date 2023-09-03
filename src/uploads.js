const express= require('express')
const Router= express.Router()


require('./routes/login')


const fileUpload= require('express-fileupload')
const mysql= require('mysql')

var connection= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'mrc'
  })
  
  connection.connect((err) =>{
     if(err){
      console.log('there was a mistake')
     }else{
      console.log('connected to database correctly conectado')
     }
  })
//uploading the following image

Router.get('/producto', (req, res)=>{
  usuario= req.session.usuario
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
const express= require('express')
const Router= express.Router()
require('./login')
const mysql= require('mysql')

//creating connection to db again 
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
// receiving information from  producto and we making a description page of each one 
Router.get('/product/:nombre_prod',  (req, res)=>{
 var {nombre_prod}= req.params
 connection.query("SELECT* FROM producto WHERE nombre_prod= ?", [nombre_prod], (err, fila)=>{
   if(err) console.log('error al conectar')
   if(fila) console.log(fila[0])
 })
    

})




module.exports= Router
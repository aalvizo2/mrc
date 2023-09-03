const express= require('express')
const mysql= require('mysql')
const Router= express.Router()

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
  const conn= connection 
  module.exports= conn
  module.exports= connection
  module.exports= Router
 


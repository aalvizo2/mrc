//libraries
const express= require('express')
const Router= express.Router()
const fileUpload= require('express-fileupload')
const mysql= require('mysql')
var conn= require('./login.js')

//db connection
const connection= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'mrc'
  })
  connection.connect((err) =>{
     if(err){
      console.log('there was a mistake')
     }else{
      console.log('connected to database correctly')
     }
  })
//middlewares
Router.use(fileUpload())
Router.use(express('public'))
Router.use(express('upload'))
//displaying all products 

  module.exports= Router
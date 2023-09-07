const express= require('express')
const Router= express.Router()
require('./login')
const mysql= require('mysql')
const path= require('path')
 Router.use(express(express.static('public')))

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
Router.get('/details', (req, res)=>{
  const getID= req.query.id
  const usuario =req.session.user
  console.log(getID)
  connection.query("SELECT * FROM producto WHERE id=?", [getID], (err, fila)=>{
    if(err) throw err
    console.log(fila)
    res.render('details', {
      login: true, 
      usuario: usuario, 
      fila: fila
    })
  })
  })
 

module.exports= Router
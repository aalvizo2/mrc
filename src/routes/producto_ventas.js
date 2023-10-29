const express= require('express')
const Router= express.Router()
require('./login')
const mysql= require('mysql')
const path= require('path')
 Router.use(express(express.static('public')))
 const connection= require('./db')

//creating connection to db again 

// receiving information from  producto and we making a description page of each one 
Router.get('/details', (req, res)=>{
  const getID= req.query.id
  const usuario =req.session.usuario
  console.log(getID)
  connection.query("SELECT * FROM producto WHERE id=?", [getID], (err, fila)=>{
    if(err) throw err
    console.log(fila)
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      
        res.render('details', {
          login: true, 
          usuario: usuario, 
          fila: fila,
          objeto: contador, 
          
          
      
        
      })
      
    })
  })
  })

Router.get('/desc_details', (req, res)=>{
  const getID= req.query.id
  const usuario =req.session.usuario
  console.log(getID)
  connection.query("SELECT * FROM descuentos WHERE id=?", [getID], (err, fila)=>{
    if(err) throw err
    console.log(fila)
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      
        res.render('details', {
          login: true, 
          usuario: usuario, 
          fila: fila,
          objeto: contador, 
          
          
      
        
      })
      
    })
  })
})
 

module.exports= Router
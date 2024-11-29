const express= require('express')
const Router= express.Router()
require('./login')
const mysql= require('mysql')
const path= require('path')
 Router.use(express(express.static('public')))
 const connection= require('./db')
const getImageUrl= require('./getImageUrl')
const getSingleImageUrl= require('./getSingleImage')

// receiving information from  producto and we making a description page of each one 
Router.get('/details', (req, res)=>{
  const getID= req.query.id
  const usuario =req.session.usuario
  console.log(getID)
  connection.query("SELECT * FROM producto WHERE id = ? ", [getID], (err, fila)=>{
    if(err) throw err
    console.log(fila)
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      

      connection.query('SELECT * FROM producto WHERE categoria= ?', [fila[0].categoria], (err, data)=> {
         if(err) throw err 
         const imagen= fila[0].img_product
         const imagenes= data.map(item=> item.img_product)
          Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
          .then((urls) => {
            getSingleImageUrl(imagen)
            .then((url) => {
              res.render('details', {
                login: true, 
                usuario: usuario, 
                fila: fila,
                objeto: contador, 
                data: data, 
                url: url,
                urls: urls, 
                currentPages: 'producto'
              })
            }) 
           
            
          })
          
         

         
      })
      
        
      
    })
  })
  })

Router.get('/desc_details', (req, res)=>{
  const getID= req.query.id
  const usuario =req.session.usuario
  connection.query("SELECT * FROM descuentos WHERE id=?", [getID], (err, fila)=>{
    if(err) throw err
    console.log(fila)
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      const imagen= fila[0].img_product
      
      getSingleImageUrl(imagen)
      .then((url) => {
        res.render('desc_details', {
          login: true, 
          usuario: usuario, 
          fila: fila,
          objeto: contador, 
          url,
          currentPages: 'promociones'
          
      
        
      })
      
      })
        
        
      
    })
  })
})
 

module.exports= Router
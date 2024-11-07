const express= require('express')
const Router= express.Router()
require('./login')
const mysql= require('mysql')
const path= require('path')
 Router.use(express(express.static('public')))
 const connection= require('./db')
 const Minio= require('minio')

 
//we gonna configurate minio 
const minioClient= new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com', 
  port: 443, 
  useSSL: true, 
  accessKey: 'Yll2kDG0a8R0OvLqqpDa',
  secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
})

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
         minioClient.presignedUrl('GET', 'images', imagen, 24*60*60, (err, url)=> {
           if(err){
              throw err 
           }


           Promise.all(imagenes.map((image) =>
              new Promise((resolve, reject) =>{
                minioClient.presignedUrl('GET', 'images', image, 24*60*60, (err, url) =>{
                  if(err){
                    reject(err)
                  }else{
                    resolve(url)
                  }
                })
              })
          ))
          .then((urls) => {
            console.log('Urls generadas', urls)
            res.render('details', {
              login: true, 
              usuario: usuario, 
              fila: fila,
              objeto: contador, 
              data: data, 
              url: url,
              urls: urls
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

      minioClient.presignedUrl('GET', 'images', imagen, 24*60*60, (err, url) => {
        if(err){
          throw err
        }
        res.render('desc_details', {
          login: true, 
          usuario: usuario, 
          fila: fila,
          objeto: contador, 
          url
          
      
        
      })
      })
        
      
    })
  })
})
 

module.exports= Router
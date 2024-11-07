const express= require('express')
const Router= express.Router()
const connection= require('./routes/db')
require('./routes/login')
const Minio= require('minio')


const fileUpload= require('express-fileupload')
const mysql= require('mysql')

//we gonna configurate minio 
const minioClient= new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com', 
  port: 443, 
  useSSL: true, 
  accessKey: 'Yll2kDG0a8R0OvLqqpDa',
  secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
})

//uploading the following image
Router.get('/producto', (req, res) => {
  var usuario = req.session.usuario
  var administrador = req.session.admin
  if (usuario) console.log(usuario)
  if (administrador) console.log(administrador)
  
  const perPage = 15
  const pagina = req.query.pagina || 1
  const offset = (pagina - 1) * perPage
  
  connection.query('SELECT * FROM producto LIMIT ? OFFSET ?', [perPage, offset], (err, row) => {
    if (err) {
      console.error('Error en la consulta de productos:', err)
      return res.status(500).send('Error en la consulta de productos')
    }
    
    const imagenes = row.map(img => img.img_product)
    
    connection.query('SELECT SUM(cantidad) as objeto FROM carrito WHERE usuario = ?', [usuario], (err, objeto) => {
      if (err) {
        console.error('Error en la consulta de carrito:', err)
        return res.status(500).send('Error en la consulta de carrito')
      }
      
      const contador = objeto[0].objeto
      
      connection.query('SELECT CEIL(COUNT(*)) AS count FROM producto', (err, conteo) => {
        if (err) {
          console.error('Error en la consulta del conteo de productos:', err)
          return res.status(500).send('Error en la consulta del conteo de productos')
        }
        
        const TotalProducts = conteo[0].count
        const totalPages = Math.ceil(TotalProducts / perPage)
        
        // Generar URLs firmadas para cada imagen en el array imagenes
        Promise.all(imagenes.map((imagen) =>
          new Promise((resolve, reject) => {
            minioClient.presignedUrl('GET', 'images', imagen, 24 * 60 * 60, (err, url) => {
              if (err) {
                reject(err)
              } else {
                resolve(url)
              }
            })
          })
        ))
        .then((urls) => {
          console.log('URLs generadas:', urls)
          res.render('producto', {
            login: true,
            admin: administrador,
            usuario: usuario,
            datos: row,
            objeto: contador,
            currentPage: pagina,
            totalPages: totalPages,
            urls: urls // Array de URLs generadas para cada imagen
          })
        })
        .catch((err) => {
          console.error('Error generando URLs:', err)
          res.status(500).send('Error al generar URLs de las imágenes')
        })
      })
    })
  })
})


 


  module.exports= Router
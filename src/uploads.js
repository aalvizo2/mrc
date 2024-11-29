const express= require('express')
const Router= express.Router()
const connection= require('./routes/db')
require('./routes/login')
const getImageUrl= require('./routes/getImageUrl')
const minioClient= require('./routes/minioClient')



// Ruta para obtener productos y generar URLs de imágenes
Router.get('/producto', (req, res) => {
  const usuario = req.session.usuario
  const administrador = req.session.admin

  const perPage = 9
  const pagina = req.query.pagina || 1
  const offset = (pagina - 1) * perPage

  connection.query('SELECT * FROM producto WHERE cantidad > 0 LIMIT ? OFFSET ?;', [perPage, offset], (err, row) => {
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

        // Generar URLs firmadas para cada imagen utilizando caché
        Promise.all(imagenes.map(imagen => getImageUrl(imagen)))
          .then((urls) => {
            res.render('producto', {
              login: true,
              admin: administrador,
              usuario: usuario,
              datos: row,
              objeto: contador,
              currentPage: pagina,
              totalPages: totalPages,
              urls: urls, 
              currentPages: 'producto' 
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
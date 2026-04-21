const express = require('express')
const router = express.Router()
const Minio = require('minio')



//Configuracion del minio 
const minioClient = new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com',
  port: 443,
  useSSL: true,
  accessKey: '1mCfC7xCqckXc8IpMI1W',
  secretKey: 'bXnp0SSwLql5fNfnPkoke1oNF4ayHhyCryAn32FW'
})

//Subir una nueva imagen maximo 10
router.post('/carousel', async (req, res) => {
  try {

    console.log('imagen que se manda', req.files)
    const imagen = req.files.imagen

    console.log('imagen que se manda', req.files)

    if (!imagen) {
      return res.status(400).json({
        msg: 'Imagen requerida'
      })
    }

    const fileName = `carousel/${Date.now()}-${imagen.name}`

    await minioClient.putObject(
      'carousel',
      fileName,
      imagen.data
    )

    const getOrderSql = `
      SELECT IFNULL(MAX(orden_num), 0) + 1 AS nextOrder
      FROM carousel
    `

    connection.query(getOrderSql, (err, result) => {
      if (err) {
        return res.status(500).json(err)
      }

      const nextOrder = result[0].nextOrder

      const insertSql = `
        INSERT INTO carousel
        (imagen_url, orden_num, activo)
        VALUES
        (?, ?, 1)
      `

      connection.query(insertSql, [fileName, nextOrder], (err2) => {
        if (err2) {
          return res.status(500).json(err2)
        }

        res.json({
          msg: 'Imagen subida y guardada correctamente'
        })
      })
    })

  } catch (error) {
    console.error('error al subir la imagen', error)

    res.status(500).json({
      msg: 'Error al subir imagen'
    })
  }
})


router.get('/settings', (req, res) =>{
    const admin= req.session.name
    if(!admin) res.redirect('/login')

    res.render('settings', {
        admin,
        login: true
    })
})



module.exports = router


const express = require('express')
const router = express.Router()
const Minio = require('minio')
const getCarouselUrl= require('./getCarouselImageUrl')


const minioClient = new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com',
  port: 443,
  useSSL: true,
  accessKey: 'vc8OzNx8t8DPMk3uuodK',
  secretKey: '3ggeOa2fsaFwDDvkF6A912PxnIOlOSrct6knspUb',
  region: 'la1'
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



// Obtener carousel
router.get('/carousel', (req, res) => {

    const sql = `
        SELECT * FROM carousel
        ORDER BY orden_num ASC
    `

    connection.query(sql, async (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ message: 'Error servidor' })
        }

        try {
            const dataFinal = await Promise.all(
                result.map(async (item) => {
                    const url = await getCarouselUrl(item.imagen_url)

                    return {
                        id: item.id,
                        imagen_url: url,
                        orden_num: item.orden_num
                    }
                })
            )

            res.json(dataFinal)

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Error imágenes' })
        }
    })
})

router.get('/settings', (req, res) =>{
    const admin= req.session.name
    if(!admin) res.redirect('/login')

    res.render('settings', {
        admin,
        login: true
    })
})



// Editar imagen del carousel
router.put('/carousel/:id', async (req, res) => {
    try {
        const { id } = req.params

        if (!req.file) {
            return res.status(400).json({
                ok: false,
                msg: 'Debes enviar una imagen'
            })
        }

        // Buscar imagen actual
        const sqlBuscar = `
            SELECT imagen_url
            FROM carousel
            WHERE id = ?
            LIMIT 1
        `

        connection.query(sqlBuscar, [id], async (err, result) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al buscar imagen'
                })
            }

            if (result.length === 0) {
                return res.status(404).json({
                    ok: false,
                    msg: 'Imagen no encontrada'
                })
            }

            const imagenAnterior = result[0].imagen_url

            // eliminar anterior del bucket (opcional)
            try {
                await minioClient.removeObject('carousel', imagenAnterior)
            } catch (e) {
                console.log('No se pudo borrar anterior')
            }

            // subir nueva imagen
            const nombreArchivo = `carousel/${Date.now()}-${req.file.originalname}`

            await minioClient.putObject(
                'carousel',
                nombreArchivo,
                req.file.buffer,
                req.file.size,
                {
                    'Content-Type': req.file.mimetype
                }
            )

            // actualizar BD
            const sqlUpdate = `
                UPDATE carousel
                SET imagen_url = ?
                WHERE id = ?
            `

            connection.query(sqlUpdate, [nombreArchivo, id], (err2) => {
                if (err2) {
                    console.log(err2)
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al actualizar'
                    })
                }

                res.json({
                    ok: true,
                    msg: 'Imagen actualizada correctamente'
                })
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        })
    }
})


module.exports = router


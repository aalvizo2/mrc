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



router.put('/carousel/:id', async (req, res) => {
    const { id } = req.params

    try {

        if (!req.files || !req.files.imagen) {
            return res.status(400).json({
                ok: false,
                msg: 'Debes enviar una imagen'
            })
        }

        const imagen = req.files.imagen

        console.log('imagen recibida', imagen.name)
        console.log('id recibido', id)

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

            // borrar imagen anterior
            try {
                await minioClient.removeObject('carousel', imagenAnterior)
            } catch (error) {
                console.log('No se pudo borrar la imagen anterior')
            }

            // nueva imagen
            const nombreArchivo = `carousel/${Date.now()}-${imagen.name}`

            try {

                await minioClient.putObject(
                    'carousel',
                    nombreArchivo,
                    imagen.data
                )

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
                            msg: 'Error al actualizar imagen'
                        })
                    }

                    return res.json({
                        ok: true,
                        msg: 'Imagen actualizada correctamente',
                        url: nombreArchivo
                    })

                })

            } catch (errorSubida) {
                console.log(errorSubida)

                return res.status(500).json({
                    ok: false,
                    msg: 'Error al subir imagen nueva'
                })
            }

        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        })
    }
})



router.delete('/carousel/:id', (req, res) => {
    const { id } = req.params

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

        const imagen = result[0].imagen_url

        try {
            // eliminar de MinIO
            await minioClient.removeObject('carousel', imagen)
        } catch (error) {
            console.log('No se pudo borrar imagen del bucket')
        }

        const sqlDelete = `
            DELETE FROM carousel
            WHERE id = ?
        `

        connection.query(sqlDelete, [id], (err2) => {

            if (err2) {
                console.log(err2)
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al eliminar registro'
                })
            }

            return res.json({
                ok: true,
                msg: 'Imagen eliminada correctamente'
            })
        })
    })
})


module.exports = router


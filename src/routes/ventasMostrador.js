const express = require('express')
const router = express.Router()
const connection = require('./db')
const { connect } = require('node:http2')

router.get('/ventasMostrador', (req, res) => {
    const admin = req.session.name

    if (!admin) res.redirect('/login')
    const query = `
        SELECT * FROM inventario WHERE cantidad > 0
     `

    connection.query(query, (err, result) => {


        if (err) throw new Error
        res.render('ventasMostrador', {
            data: result,
            login: true,
            admin: admin
        })
    })

})

// Ventas mostrador
router.post('/ventas-mostrador', (req, res) => {
    const { carrito, total, recibido, cambio } = req.body

    const sqlVenta = `
        INSERT INTO ventas_mostrador (total, recibido, cambio, fecha)
        VALUES (?, ?, ?, NOW())
    `

    connection.query(sqlVenta, [total, recibido, cambio], (err, result) => {
        if (err) {
            console.error('Error al insertar venta:', err)
            return res.status(500).send('Error en el servidor')
        }

        const ventaId = result.insertId

        const sqlDetalle = `
            INSERT INTO detalle_venta
            (venta_id, producto_id, nombre, precio, cantidad, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `

        let pendientes = carrito.length

        if (pendientes === 0) {
            return res.status(200).send('Venta registrada')
        }

        carrito.forEach(p => {
            const precioFinal = p.precio * (1 - (p.descuento || 0) / 100)
            const subtotal = precioFinal * p.cantidad
            const esServicio = String(p.id).startsWith('serv-')

            // 👇 SOLO ESTA PARTE CAMBIA:
            // si es servicio guardamos el id tal cual
            const productoId = esServicio ? p.id : p.id

            connection.query(
                sqlDetalle,
                [
                    ventaId,
                    productoId,
                    p.nombre,
                    precioFinal,
                    p.cantidad,
                    subtotal
                ],
                (err) => {
                    if (err) {
                        console.log('Error detalle:', err)
                    }
                }
            )

            // Si es producto, descontar inventario
            if (!esServicio) {
                const sqlCantidad = `
                    UPDATE inventario
                    SET cantidad = cantidad - ?
                    WHERE id = ?
                `

                connection.query(sqlCantidad, [p.cantidad, p.id], (err) => {
                    if (err) console.log(err)
                })
            }

            pendientes--

            if (pendientes === 0) {
                const sqlCajaActual = `
                  SELECT id, caja_chica
                  FROM corte_caja
                  ORDER BY id DESC
                  LIMIT 1
                `

                connection.query(sqlCajaActual, (err, cajaResult) => {
                    if (err) {
                        console.log(err)
                        return res.status(500).send('Error al consultar caja')
                    }

                    if (cajaResult.length === 0) {
                        return res.status(400).send('No existe corte de caja hoy')
                    }

                    const idCaja = cajaResult[0].id
                    const cajaActual = Number(cajaResult[0].caja_chica)
                    const nuevaCaja = cajaActual + Number(total)

                    const sqlActualizarCaja = `
                        UPDATE corte_caja
                        SET caja_chica = ?
                        WHERE id = ?
                    `

                    connection.query(
                        sqlActualizarCaja,
                        [nuevaCaja, idCaja],
                        (err) => {
                            if (err) {
                                console.log(err)
                                return res.status(500).send('Error al actualizar caja')
                            }

                            return res.status(200).send('Venta registrada')
                        }
                    )
                })
            }
        })
    })
})


router.get('/ventas-hoy', (req, res) => {

    const sql = `
        SELECT COALESCE(SUM(total),0) AS total
        FROM ventas_mostrador
        WHERE corte_id IS NULL
    `

    connection.query(sql, (err, ventas) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error')
        }

        res.json({
            totalVentas: ventas[0].total || 0
        })
    })
})

module.exports = router
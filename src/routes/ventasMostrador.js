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
            const esServicio = p.id.startsWith('serv-')

            // Guardar detalle venta
            connection.query(
                sqlDetalle,
                [
                    ventaId,
                    esServicio ? null : p.id,
                    p.nombre,
                    precioFinal,
                    p.cantidad,
                    subtotal
                ],
                (err) => {
                    if (err) {
                        console.log(err)
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

            // Cuando termina todo el carrito actualizamos caja chica UNA sola vez
            if (pendientes === 0) {
                const sqlCajaActual = `
                    SELECT id, caja_chica
                    FROM corte_caja
                    WHERE DATE(fecha) = CURDATE()
                    ORDER BY fecha DESC
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

                    // Si recibió 500 y total era 350:
                    // se entregan 150 de cambio
                    // la caja realmente gana 350
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

                            console.log('Caja actualizada correctamente')
                            console.log('Caja anterior:', cajaActual)
                            console.log('Venta total:', total)
                            console.log('Cambio entregado:', cambio)
                            console.log('Caja nueva:', nuevaCaja)

                            return res.status(200).send('Venta registrada')
                        }
                    )
                })
            }
        })
    })
})
//Ventas del dia
router.get('/ventas-hoy', (req, res) => {

    const sqlVentas = `
      SELECT COALESCE(SUM(total), 0) AS total
      FROM ventas_mostrador
      WHERE DATE(fecha) = CURDATE()
    `
    connection.query(sqlVentas, (err, ventas) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error')
        }

        const sqlCaja = `
           SELECT monto_inicial 
           FROM corte_caja
           WHERE fecha >= CURDATE()
           AND fecha < CURDATE() + INTERVAL 1 DAY
           ORDER BY id DESC
           LIMIT 1
        `
        connection.query(sqlCaja, (err, caja) => {
            if (err) {
                console.error(err)
                return res.status(500).send('Error')
            }

            res.json({
                totalVentas: ventas[0]?.total || 0,
                montoInicial: caja[0]?.monto_inicial || 0
            })
        })
    })
})

module.exports = router
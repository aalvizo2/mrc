const express = require('express')
const router = express.Router()
const connection = require('./db')

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

        carrito.forEach(p => {

            // 🔥 aplicar descuento igual que frontend
            const precioFinal = p.precio * (1 - (p.descuento || 0) / 100)
            const subtotal = precioFinal * p.cantidad

            const esServicio = p.id.startsWith('serv-')

            connection.query(sqlDetalle, [
                ventaId,
                esServicio ? null : p.id, // 👈 servicios no tienen producto_id
                p.nombre,
                precioFinal, // 👈 guardas precio con descuento aplicado
                p.cantidad,
                subtotal
            ], (err) => {
                if (err) {
                    console.error('Error al insertar detalle:', err)
                }
            })

            // 🔥 SOLO productos afectan inventario
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

        })

        console.log('Venta y detalle guardados correctamente')
        res.status(200).send('Venta Registrada')
    })
})

//Ventas del dia
router.get('/ventas-hoy', (req, res) => {

    const sqlVentas = `
        SELECT SUM(total) as total
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
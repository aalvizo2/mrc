const express= require('express')
const router= express.Router()
const connection= require('./db')

router.get('/ventasMostrador', (req, res) => {
    const admin= req.session.name

    if(!admin) res.redirect('/login')
     const query=`
        SELECT * FROM inventario WHERE cantidad > 0
     ` 

     connection.query(query, (err, result) => {

        
        if(err) throw new Error 
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

    // 1. Insertar venta
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

        // 2. Insertar detalle de cada producto
        const sqlDetalle = `
            INSERT INTO detalle_venta 
            (venta_id, producto_id, nombre, precio, cantidad, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `

        // 🔥 Insertar todos los productos
        carrito.forEach(p => {
            const subtotal = p.precio * p.cantidad

            connection.query(sqlDetalle, [
                ventaId,
                p.id,
                p.nombre,
                p.precio,
                p.cantidad,
                subtotal
            ], (err) => {
                if (err) {
                    console.error('Error al insertar detalle:', err)
                }

                //Rebajamos la cantidad 
                const sqlCantidad=`
                   UPDATE inventario SET cantidad= cantidad - ?
                `

                connection.query(sqlCantidad, [p.cantidad], (err) =>{
                   if(err) console.log(err)
                   console.log('Cantidad actualizada en inventario')
                })
            })
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
            WHERE DATE(fecha) = CURDATE()
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

module.exports= router
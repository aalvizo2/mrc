const express = require('express')
const router = express.Router()


router.get('/corteCaja', (req, res) => {
    const admin = req.session.name
    if (!admin) res.redirect('/login')
    res.render('corteCaja', {
        login: true,
        admin: admin
    })
})


//Endpoint para corte de caja 
router.post('/corte-caja', (req, res) => {
    const { montoInicial, gastos, cajaChica, dineroReal, totalVentas } = req.body

    // 🔥 Validaciones básicas
    if (!montoInicial && montoInicial !== 0) {
        return res.status(400).send('Monto inicial requerido')
    }

    // 🧮 Calcular gastos
    let totalGastos = 0
    gastos.forEach(g => {
        totalGastos += Number(g.monto)
    })

    // 🧮 Calcular esperado y diferencia
    const totalEsperado = montoInicial + totalVentas - totalGastos
    const diferencia = dineroReal - totalEsperado

    // 1️⃣ Insertar corte
    const sqlCorte = `
        INSERT INTO corte_caja 
        (monto_inicial, total_ventas, total_gastos, caja_chica, dinero_real, total_esperado, diferencia)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    connection.query(sqlCorte, [
        montoInicial,
        totalVentas,
        totalGastos,
        cajaChica,
        dineroReal,
        totalEsperado,
        diferencia
    ], (err, result) => {

        if (err) {
            console.error('Error al guardar corte:', err)
            return res.status(500).send('Error en el servidor')
        }

        const corteId = result.insertId

        // 2️⃣ Insertar gastos
        if (gastos.length > 0) {
            const sqlGasto = `
                INSERT INTO gastos_corte (corte_id, descripcion, monto)
                VALUES (?, ?, ?)
            `

            gastos.forEach(g => {
                connection.query(sqlGasto, [
                    corteId,
                    g.desc,
                    g.monto
                ], (err) => {
                    if (err) {
                        console.error('Error al insertar gasto:', err)
                    }
                })
            })
        }

        console.log('Corte guardado correctamente')
        res.status(200).send({
            message: 'Corte guardado',
            totalEsperado,
            diferencia
        })
    })
})


//Endpoint para ver los cortes 
router.get('/corte-caja', (req, res) => {
    const sql = `
        SELECT * FROM corte_caja
        ORDER BY fecha DESC
    `

    connection.query(sql, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error')
        }

        res.json(result)
    })
})


//Ver detalle de un corte 
router.get('/corte-caja/:id', (req, res) => {
    const { id } = req.params

    const sqlCorte = `SELECT * FROM corte_caja WHERE id = ?`
    const sqlGastos = `SELECT * FROM gastos_corte WHERE corte_id = ?`

    connection.query(sqlCorte, [id], (err, corte) => {
        if (err) return res.status(500).send(err)

        connection.query(sqlGastos, [id], (err, gastos) => {
            if (err) return res.status(500).send(err)

            res.json({
                corte: corte[0],
                gastos
            })
        })
    })
})


//Detalle del corte de caja 
router.get('/historial-cortes', (req, res) => {
    const admin = req.session.name
    if (!admin) res.redirect('/login')
    res.render('historialCortes', {
        login: true,
        admin: admin
    })
})


//Ver detalle del corte 
router.get('/detalle-corte/:id', (req, res) => {
    const { id } = req.params

    const sqlCorte = `SELECT * FROM corte_caja WHERE id = ?`

    connection.query(sqlCorte, [id], (err, corte) => {
        if (err) return res.status(500).send(err)

        const c = corte[0]

        // 🔥 ventas del rango
        const sqlVentas = `
          SELECT * FROM ventas_mostrador
          WHERE DATE(fecha) = DATE(?)
        `

        const sqlGastos = `
            SELECT * FROM gastos_corte WHERE corte_id = ?
        `

        connection.query(sqlVentas, [c.fecha], (err, ventas) => {
            if (err) return res.status(500).send(err)

            connection.query(sqlGastos, [id], (err, gastos) => {
                if (err) return res.status(500).send(err)

                res.json({
                    corte: c,
                    ventas,
                    gastos
                })
            })
        })
    })
})


router.get('/detalle-venta/:id', (req, res) => {
    const { id } = req.params

    const sql = `
        SELECT * FROM detalle_venta
        WHERE venta_id = ?
    `

    connection.query(sql, [id], (err, productos) => {

        if (err) {
            console.error('ERROR SQL:', err)
            return res.status(500).send(err)
        }

        // 🔥 FIX
        const lista = productos || []

        const total = lista.reduce((acc, p) => acc + Number(p.precio || 0), 0)

        res.json({
            productos: lista,
            total
        })
    })
})
module.exports = router
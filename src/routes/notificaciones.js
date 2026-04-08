const express= require('express')
const router= express.Router()
const connection= require('./db')

router.get('/stock-bajo', (req, res) =>{
    const sql=`
      SELECT producto, cantidad
      FROM inventario
      WHERE cantidad <= 5
      ORDER BY cantidad ASC
    `
    connection.query(sql, (err, result) => {
        if(err){
            console.error(err)
            return res.status(500).json({error: "error al obtener los datos"})
        }
        
        res.json(result)
    })
    
})

// 💬 ENVIAR MENSAJE
router.post('/chat', (req, res) => {
    const { usuario, mensaje } = req.body

    if (!usuario || !mensaje) {
        return res.status(400).json({ error: 'Datos incompletos' })
    }

    const sql = `
        INSERT INTO mensajes (usuario, mensaje)
        VALUES (?, ?)
    `

    connection.query(sql, [usuario, mensaje], (err) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ error: 'Error guardando mensaje' })
        }

        res.json({ ok: true })
    })
})


// OBTENER MENSAJES
router.get('/chat', (req, res) => {
    const sql = `
        SELECT usuario, mensaje, tipo
        FROM mensajes
        ORDER BY id DESC
        LIMIT 10
    `

    connection.query(sql, (err, result) => {
        if (err) return res.json([])
        res.json(result)
    })
})


module.exports= router
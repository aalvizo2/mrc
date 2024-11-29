const express= require('express')
const Router= express.Router()
const connection= require('./db')
const getImageUrl= require('./getImageUrl')

Router.get('/marca', (req, res) => {
    const marca = `%${req.query.marca}%`
    const usuario = req.session.usuario
    const page = parseInt(req.query.page) || 1
    const limit = 15
    const offset = (page - 1) * limit

    connection.query('SELECT COUNT(*) as total FROM producto WHERE nombre_prod LIKE ?', [marca], (err, countResults) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error en la consulta')
        }

        const totalItems = countResults[0].total
        const totalPages = Math.ceil(totalItems / limit)

        connection.query('SELECT * FROM producto WHERE nombre_prod LIKE ? LIMIT ? OFFSET ?', [marca, limit, offset], (error, results) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Error en la consulta')
            }

            const imagenes= results.map(item=> item.img_product)


            connection.query('SELECT SUM(cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto) => {
                const contador = objeto[0]?.objeto || 0
                Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
                 .then((urls) => {
                    res.render('marcas', {
                        Data: results,
                        usuario: usuario,
                        objeto: contador,
                        currentPage: page,
                        totalPages: totalPages,
                        marca: req.query.marca, 
                        urls: urls, 
                        currentPages: 'producto'
                    })
                 })
                
            })
        })
    })
})




module.exports= Router
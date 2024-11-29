const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')
const getImageUrl= require('./getImageUrl')

Router.get('/refacciones', (req, res)=>{
    usuario= req.session.usuario
    connection.query('SELECT * FROM producto WHERE categoria="refacciones"', (err, refacciones)=>{
        connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
            const imagenes= refacciones.map(item=> item.img_product)
            const contador= objeto[0].objeto

            Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
            .then((urls) => {
                res.render('refacciones', {
                    login: true, 
                    usuario: usuario, 
                    datos: refacciones,
                    objeto: contador, 
                    urls: urls, 
                    currentPages: 'producto'
                 })
            })
            
        })      
        
    })
})


module.exports= Router
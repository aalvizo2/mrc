const express= require('express')
const Router= express.Router()
const connection= require('./db')
const getImageUrl= require('./getImageUrl')

Router.get('/search', (req, res)=>{
    const usuario= req.session.usuario
    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        
        const contador= objeto[0].objeto
        
        res.render('search', {
            login: true,
            usuario: usuario, 
            objeto: contador,
            currentPages: 'buscar'
        })
    })    
})
Router.get('/buscar', (req, res)=>{
    console.log('hola desde buscar')
})
Router.post('/buscar', (req,res)=>{
    const {buscar}= req.body
    connection.query('SELECT * FROM producto WHERE nombre_prod LIKE ?', ['%' + buscar + '%'], (err, busqueda)=>{
        const imagenes= busqueda.map(imagen => imagen.img_product)
        const usuario= req.session.usuario

    connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        
        const contador= objeto[0].objeto
        Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
        .then((urls) =>{
            res.render('buscar', {
                login: true,
                usuario: usuario, 
                objeto: contador, 
                busqueda: busqueda,
                urls, 
                currentPages: 'buscar'
            })
        })
        
    }) 
    })
})
Router.get('/limpiar', (req, res)=>{
    res.redirect('search')
})



module.exports= Router
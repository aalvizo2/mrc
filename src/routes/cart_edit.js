const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')

Router.get('/update_cart', (req, res)=>{
    const usuario= req.session.usuario
    const consulta= 'SELECT * FROM carrito WHERE usuario=?'
    connection.query(consulta, [usuario], (err, fila)=>{
        if(err) throw err
        res.render('update_cart', {
            login: true,
            usuario: usuario, 
            fila: fila
        })
    })
})
Router.get('/cart_edit/:id', (req, res)=>{
    const {id}= req.params
    const {cantidad}= req.body
    console.log(id, cantidad)
   
  })


module.exports= Router
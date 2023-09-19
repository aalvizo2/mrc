const express= require('express')
require('./login')
const connection= require('./db')

const Router= express.Router()
//we requiring login so we can use its session 
require('./login')

//we setting up the cart and we starting up with it
Router.post('/add-to-cart', (req, res)=>{
    const usuario= req.session.usuario
    if(!usuario){
        res.redirect('login')
    }else{
        const {img_product}= req.body
        const {nombre_prod}= req.body
        const{precio_publico}= req.body
        const {cantidad}= req.body
        const fecha= Date.now()
        const total= precio_publico * cantidad
        connection.query("INSERT INTO carrito (img_prod, usuario, producto, precio, cantidad, fecha, total) VALUES(?,?,?,?,?,?, ?)", [img_product, usuario, nombre_prod, precio_publico, cantidad, fecha, total], (err)=>{
            if(err) throw err 
            console.log('se han agregado correctamente los productos al carrito')
        })
    }
})
Router.get('/cart', (req, res)=>{
    usuario= req.session.usuario
    connection.query('SELECT * FROM CARRITO WHERE usuario=?', [usuario], (err, row)=>{
        if(err) throw err
        console.log(row)
        res.render('cart', {
            login: true, 
            usuario: usuario, 
            fila: row
        })
    })
   
})
Router.get('/delete/:id', (req, res) =>{
    const {id}= req.params
    connection.query('DELETE FROM carrito WHERE id=?', [id], (res, err)=>{
      
      console.log('se ha eliminado')
    })
    if(id){
        res.redirect('/cart')
    }
})



module.exports= Router
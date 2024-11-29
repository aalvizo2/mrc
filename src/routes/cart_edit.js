const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const getImageUrl= require('./getImageUrl')

Router.get('/update_cart', (req, res)=>{
    const usuario= req.session.usuario
    const consulta= 'SELECT * FROM carrito WHERE usuario=?'
    connection.query(consulta, [usuario], (err, fila)=>{
        if(err) throw err
        const imagenes= fila.map(item=> item.img_prod)
       Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
       .then((urls) => {
          res.render('update_cart', {
             login: true,
             usuario: usuario, 
             fila: fila, 
             urls: urls
          })
       })
        
    })
})
Router.post('/cart_edit', (req, res)=>{
    const {id, cantidad}= req.body
    console.log(id, cantidad)
    connection.query('UPDATE carrito SET cantidad=?  WHERE id=?', [cantidad, id], (err)=>{
      if(err) throw err 
      console.log('carrito actualizado correctamente')
      res.redirect('cart')
    })
   
  })


module.exports= Router
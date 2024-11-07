const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const Minio= require('minio')


//we gonna configurate minio 
const minioClient= new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com', 
  port: 443, 
  useSSL: true, 
  accessKey: 'Yll2kDG0a8R0OvLqqpDa',
  secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
})

Router.get('/update_cart', (req, res)=>{
    const usuario= req.session.usuario
    const consulta= 'SELECT * FROM carrito WHERE usuario=?'
    connection.query(consulta, [usuario], (err, fila)=>{
        if(err) throw err
        const imagenes= fila.map(item=> item.img_prod)
        Promise.all(imagenes.map((imagen) =>
          new Promise((resolve, reject) => {
           minioClient.presignedUrl('GET', 'images', imagen, 24*60*60, (err, url)=> {
               if(err){
                   reject(err)
               }else{
                   resolve(url)
               }
           })
          })
       ))
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
    connection.query('UPDATE carrito SET cantidad= cantidad +? WHERE id=?', [cantidad, id], (err)=>{
      if(err) throw err 
      console.log('carrito actualizado correctamente')
      res.redirect('cart')
    })
   
  })


module.exports= Router
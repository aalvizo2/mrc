const express= require('express')
require('./login')
const connection= require('./db')
const { format } = require('date-fns')
const es = require('date-fns/locale/es')
const Minio= require('minio')
const Router= express.Router()
//we requiring login so we can use its session 
require('./login')


//we gonna configurate minio 
const minioClient= new Minio.Client({
    endPoint: 'g7l6.la1.idrivee2-91.com', 
    port: 443, 
    useSSL: true, 
    accessKey: 'Yll2kDG0a8R0OvLqqpDa',
    secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
  })

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
        const fecha_actual= new Date() 
        const Formato_letra= "EEEE, d 'de' MMMM 'de' yyyy"
        const FechaConLetra= format(fecha_actual, Formato_letra,{locale: es})
        console.log(FechaConLetra)
        const total= precio_publico * cantidad
        
        
        connection.query('SELECT * FROM carrito WHERE usuario=? AND producto=?', [usuario, nombre_prod], (err, resultado)=>{
            
            if(resultado.length === 0){
                connection.query("INSERT INTO carrito (img_prod, usuario, producto, precio, cantidad, fecha, total) VALUES(?,?,?,?,?,?, ?)", [img_product, usuario, nombre_prod, precio_publico, cantidad, FechaConLetra, total], (err)=>{
                    if(err) throw err 
                    console.log('se han agregado correctamente los productos al carrito')
                    res.redirect('cart')
                })
            }else{
                
                connection.query('UPDATE carrito SET cantidad= cantidad+ ?, total= precio*cantidad WHERE producto=? AND usuario=?', [cantidad, nombre_prod, usuario], (err)=>{
                    if(err) throw err 
                    res.redirect('cart')
                })
                
            }
        })
      
    }
})
Router.get('/cart', (req, res)=>{
    const usuario= req.session.usuario
    connection.query('SELECT * FROM carrito WHERE usuario=?', [usuario], (err, fila)=>{
        connection.query('SELECT * FROM ventas WHERE usuario=?', [usuario], (err, venta)=>{
            connection.query('SELECT SUM(total) AS suma FROM carrito WHERE usuario=?', [usuario], (err, suma)=>{
                   const total= suma[0].suma
                   
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
                    res.render('cart', {
                        login: true, 
                        usuario: usuario, 
                        fila: fila, 
                        venta: venta, 
                        total:total,
                        urls: urls
                    })
                 })

                   
                  
                
                
            
            })
           
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
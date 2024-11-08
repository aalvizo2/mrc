const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const minioClient= require('./minioClient')
const getImageUrl= require('./getImageUrl')

Router.get('/descuento_admin',(req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('login')
    }
    connection.query('SELECT nombre_prod FROM producto', (err, producto)=>{
        console.log(producto)
             
        
        const descripcion= producto
        console.log(descripcion) 
       
        res.render('descuento_admin', {
            login: true, 
            admin: admin,
            producto, producto
        })
    })
    
});
Router.post('/insertar', (req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('login')
    }
    const {producto}= req.body
    console.log(producto)
    connection.query('SELECT * FROM producto WHERE nombre_prod=?',[producto], (err, dato)=>{
        const datos= dato[0]
        const imagen= dato[0].img_product

        minioClient.presignedUrl('GET', 'images', imagen, 24*60*60, (err, url) =>{
            if(err) throw err 
            res.render('insertar', {
                dato, datos, 
                login: true, 
                admin: admin, 
                url
            })
        })
        
    })
    
});
Router.post('/insertar_oferta', (req, res)=>{
    const {img_product, nombre_prod, descripcion, precio, precio_publico}= req.body
    console.log(img_product, nombre_prod, descripcion, precio, precio_publico)
    connection.query('INSERT INTO descuentos (img_product, nombre_prod, descripcion, precio, precio_publico) VALUES (?,?,?,?,?)', [img_product, nombre_prod, descripcion, precio, precio_publico], (err)=>{
        console.log('Datos insertados correctamente en descuentos')
    })
    connection.query('UPDATE producto SET precio_publico=? WHERE nombre_prod=?', [precio_publico,  nombre_prod], (err)=>{
        console.log('producto actualizado correctamente')
    })
    res.redirect('producto_admin')
})
Router.get('/descuentos', (req, res)=>{
    const perPage= 18
    const pagina= req.query.pagina || 1
    const offset= (pagina -1)* perPage
    connection.query('SELECT* FROM descuentos LIMIT ? OFFSET ? ',[perPage, offset], (err, row)=>{
      const usuario= req.session.usuario
      console.log(row)
      connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
        const contador= objeto[0].objeto
        
        connection.query('SELECT CEIL(COUNT (*)) AS count FROM descuentos', (err, conteo)=>{
          const TotalProducts= conteo[0].count
          console.log(conteo)
          const totalPages= Math.ceil(TotalProducts/perPage)
          console.log(totalPages)
          const imagenes= row.map(item=> item.img_product)
          
          //Cargamos las imagenes del minio 
          Promise.all(imagenes.map(imagen => getImageUrl(imagen)))
          .then((urls) => {
            res.render('descuentos', {
                login: true,
                urls: urls,
                usuario: usuario,
                datos: row,
                objeto: contador, 
                currentPage: pagina,
                totalPages: totalPages
                
      
            })
          })


          
        })    
      })
});
})


module.exports= Router
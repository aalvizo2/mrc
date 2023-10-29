const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const { runInNewContext } = require('vm')
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
        const img_product= dato[0].img_product
        const nombre_prod= dato[0].nombre_prod
        const descripcion= dato[0].descripcion
        const precio= dato[0].precio
        const precio_publico= dato[0].precio_publico
        res.render('insertar', {
            dato, datos, 
            login: true, 
            admin: admin
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
    const perPage= 3
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
          res.render('descuentos', {
            login: true,
            
            usuario: usuario,
            datos: row,
            objeto: contador, 
            currentPage: pagina,
            totalPages: totalPages
            
  
          })
        })    
      })
});
})


module.exports= Router
const express= require('express')
const Router= express.Router()
const connection= require('./db')
const getImageUrl= require('./getImageUrl')
const getSingleImageUrl= require('./getSingleImage')

Router.get('/producto_admin', (req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('/login')
    }else{
    connection.query('SELECT * FROM producto', (err, datos)=>{
        if(err) throw err
        console.log(datos)
        const imagenes= datos.map(item=> item.img_product)
        
        Promise.all(imagenes.map(imagen=> getImageUrl(imagen)))
        .then((urls) =>{
            res.render('producto_admin', {
                login: true, 
                admin: admin, 
                datos: datos, 
                urls: urls
            })
        })
        
        
    })
    }
})
//I'm about to require update page 
Router.get('/update', (req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('login')
    }else{
    const {id}= req.query
    
    connection.query('SELECT * FROM producto WHERE id=?', [id], (err, fila)=>{
        const imagen= fila[0].img_product
        getSingleImageUrl(imagen)
        .then((url) => {
            res.render('update', {
                login: true, 
                admin: admin, 
                fila: fila, 
                url: url
            })
        })
        
        
    })
    
   }  
})
//updating new products 
Router.post('/actualizar', async(req, res)=>{
    const {id}= req.body
    const {nombre_prod}= req.body
    const{descripcion}= req.body
    const {precio}= req.body
    const{precio_publico}= req.body
    const {cantidad}= req.body
    console.log(id, nombre_prod, descripcion, precio, precio_publico)
    connection.query('UPDATE producto SET nombre_prod=?, descripcion=?, precio=?, precio_publico=?, cantidad=? WHERE id=?', [nombre_prod,descripcion, precio, precio_publico, cantidad, id], (err)=>{
        if(err) throw err 
        res.redirect('producto_admin')
    })
})
Router.get('/eliminar/:id', (req, res) => {
    const id = parseInt(req.params.id, 10); // Convertir a número para evitar errores
  
    if (isNaN(id)) {
      return res.status(400).send({ message: 'ID inválido' }); // Validar que sea un número
    }
  
    connection.query('DELETE FROM producto WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error al eliminar:', err); // Log para depuración
        return res.status(500).send({ message: 'Error al eliminar el producto' });
      }
      res.redirect('/producto_admin'); // Asegúrate que la ruta esté bien definida
    });
  });
  

module.exports=Router
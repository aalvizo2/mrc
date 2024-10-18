const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')

Router.get('/producto_admin', (req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('/login')
    }else{
    connection.query('SELECT * FROM producto', (err, datos)=>{
        if(err) throw err
        console.log(datos)
        res.render('producto_admin', {
            login: true, 
            admin: admin, 
            datos: datos
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
    console.log(id)
    connection.query('SELECT * FROM producto WHERE id=?', [id], (err, fila)=>{
        console.log(fila)
        res.render('update', {
            login: true, 
            admin: admin, 
            fila: fila
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
    console.log(id, nombre_prod, descripcion, precio, precio_publico)
    connection.query('UPDATE producto SET nombre_prod=?, descripcion=?, precio=?, precio_publico=? WHERE id=?', [nombre_prod,descripcion, precio, precio_publico, id], (err)=>{
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
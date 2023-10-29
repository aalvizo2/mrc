//libraries
const express= require('express')
const Router= express.Router()
const fileUpload= require('express-fileupload')
const mysql= require('mysql')
var conn= require('./login.js')
const connection= require('./db')


//middlewares
Router.use(fileUpload())
Router.use(express('public'))
Router.use(express('upload'))
//displaying all products +Router.get('/upload', (req, res) =>{
Router.get('/upload', (req, res)=>{
  if(req.session.admin){
    const admin = req.session.name
    res.render('upload', {
      login: true,
      admin: admin
    })
    Router.post('/producto', (req, res)=>{
      var nombre_prod= req.body.nombre_prod
      var imagen= req.files.imagen
      var uploadpath= path.join(__dirname, '..', 'public', 'productos', imagen.name)
      
      
      var img_prod= req.files.imagen.name
      var descripcion= req.body.descripcion
      var precio= req.body.precio
      var precio_publico= req.body.precio_publico
      var {categoria}= req.body
      console.log(categoria)
      console.log(nombre_prod, descripcion, precio, precio_publico, imagen.name)
      //moving uploaded file 
      imagen.mv(uploadpath)
      connection.query("INSERT INTO producto(img_product, nombre_prod, descripcion, precio, precio_publico, categoria) VALUES(?,?,?,?,?, ?)", [img_prod, nombre_prod, descripcion, precio, precio_publico, categoria], (err, rows)=>{
        if(err) throw err
        res.render('upload', {
          alert: true,
          alertMessage: "Producto agregado correctamente",
          alertIcon:'success',
          showConfirmButton: true,
          timer: false,
          ruta: 'producto_admin'    
      })
      res.redirect('producto_admin')
      })
      
    })
    
  }else{
    res.redirect('/login')
  }
})


  module.exports= Router
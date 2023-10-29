const express= require('express')
const Router= express.Router()
const mysql= require('mysql')
const multer= require('multer')
const connection= require('./db')
const Swal= require('sweetalert2')
var ruta= '../uploads/'
const bcrypt= require ('bcrypt')
const fileUpload= require('express-fileupload')
Router.use(express.urlencoded({extended: true}))
Router.use(express.json())
const session= require('express-session')
const path= require('path')
Router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

Router.use(fileUpload())
Router.use(express('public'))
Router.use(express('upload'))

//we creating login view 
Router.get('/login', (req, res)=>{
  res.render('login')
})

Router.post('/auth', async(req, res)=>{
    var user= req.body.usuario
    var pass= req.body.pass
    
    connection.query("SELECT * FROM administrador WHERE admin=? AND pass=?",[user, pass], (err, data, fields)=>{
      if(data.length > 0){
        req.session.admin = true
        req.session.name= user
        res.redirect('inicio_admin')
        
      }else{
        connection.query("SELECT * FROM usuario WHERE usuario=? AND pass=?", [user, pass], (err, data, fields)=>{
          if(data.length >0){
            req.session.user= true
            req.session.usuario= user
            res.redirect('/')
            
          }else{
            res.render('login', {
              alert: true,
              alertMessage: "Error de autenticación",
              alertIcon:'error',
              showConfirmButton: true,
              timer: false,
              ruta: 'login'    
          });
          }
        })
      }
    })
})   
Router.get('/inicio_admin', (req, res) =>{
  if(req.session.admin){
    const admin = req.session.name
    res.render('inicio_admin', {
      login: true,
      admin: admin
    })
  }else{
    res.redirect('/login')
  }
})
Router.get('/logout', (req, res)=>{
  req.session.destroy()
  res.redirect('login')
})
Router.get('/', (req, res)=>{
  if(req.session.user){
    const usuario= req.session.usuario
    res.render('inicio_usuario',{
      login: true,
      usuario: usuario
    })
  }else{
    res.redirect('login')
  }
})


Router.get('/upload', (req, res) =>{
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
       res.redirect('/producto_admin')
      })
      
    })
    
  }else{
    res.redirect('/login')
  }
})


var usuario= session.user
var admin= session.name
module.exports= admin
module.exports= usuario
module.exports=Router

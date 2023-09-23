const express= require('express')
const router= express.Router()
router.use(express.urlencoded({extended: true}))
var mysql= require('mysql')
const connection= require('./db')
//we loading register page and rendering it
router.get('/registro', (req, res) =>{
  res.render('registro')
})
router.post('/registro', async(req, res)=>{
  var user= req.body.usuario
  var password= req.body.pass
  var {rep}=req.body
 
  
  var correoe= req.body.email
  console.log(user, password, correoe)
  if(user, password, correoe){
    res.render('login', {
      alert: true,
      alertMessage: "Usuario Registrado Correctamente",
      alertIcon:'success',
      showConfirmButton: true,
      timer: false,
      ruta: 'login'    
  })
    connection.query('INSERT INTO usuario (usuario, pass, email) VALUES(?, ?, ?)', [user, password, correoe], (err, rows)=>{
       if(err) throw err
       
     })
    }else{
      console.log('favor de insertar todos los datos ')
    }
})






module.exports= router

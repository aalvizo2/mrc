const express= require('express')
const router= express.Router()
router.use(express.urlencoded({extended: true}))
var mysql= require('mysql')

const connection= mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'mrc'
})
connection.connect((err) =>{
   if(err){
    console.log('there was a mistake')
   }else{
    console.log('connected to database correctly')
   }
})

router.post('/registro', async(req, res)=>{
  var user= req.body.usuario
  var password= req.body.pass
  var correoe= req.body.email
  console.log(user, password, correoe)
  if(user, password, correoe){
    connection.query('INSERT INTO usuario (usuario, pass, email) VALUES(?, ?, ?)', [user, password, correoe], (err, rows)=>{
       if(err) throw err
       console.log('datos insertados correctamente ')
       res.redirect('login')
     })
    }else{
      console.log('favor de insertar todos los datos ')
    }
})






module.exports= router

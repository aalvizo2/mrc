const express = require('express')
const Router = express.Router()
const mysql = require('mysql')
const connection = require('./db')
const Swal = require('sweetalert2')
const Minio = require('minio')
const bcrypt = require('bcrypt')
const session = require('express-session')
const path = require('path')
//const fileUpload= require('express-fileupload')
Router.use(express.urlencoded({ extended: true }))
Router.use(express.json())

Router.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
//Router.use(fileUpload())
Router.use(express('public'))
Router.use(express('upload'))

//we creating login view 
Router.get('/login', (req, res) => {
  res.render('login')
})

Router.post('/auth', async (req, res) => {

  const user = req.body.usuario
  const pass = req.body.pass
  console.log('datos que se envian', req.body)

  connection.query(
    "SELECT * FROM administrador WHERE admin=? AND pass=?",
    [user, pass],
    (err, data) => {

      if (err) {
        console.error(err)
        return res.status(500).send('Error interno')
      }

      if (data.length > 0) {
        req.session.admin = true
        req.session.name = user
        return res.redirect('inicio_admin')
      }

      connection.query(
        "SELECT * FROM usuario WHERE usuario=?",
        [user],
        async (err, data) => {

          if (err) return res.status(500).send('Error interno')

          if (data.length === 0) {
            return res.status(401).send({ message: 'Usuario no encontrado' })
          }

          const usuarioDB = data[0]

          const isMatch = await bcrypt.compare(pass, usuarioDB.pass)

          if (!isMatch) {
            return res.status(401).send({ message: 'Contraseña incorrecta' })
          }

          req.session.user = true
          req.session.usuario = user
          return res.redirect('/')
        }
      )
    }
  )
})

Router.get('/inicio_admin', (req, res) => {

  if (!req.session.admin) {
    return res.redirect('/login')
  }

  const admin = req.session.name

  connection.query('SELECT COUNT(*) AS totalProductos FROM producto', (err, results) => {

    if (err) return res.status(500).send('Error')

    const totalProductos = results[0].totalProductos

    connection.query('SELECT SUM(total) AS total_ventas FROM ventas', (err, resultado) => {

      if (err) return res.status(500).send('Error')

      const totalVentas = resultado[0].total_ventas

      connection.query(
        'SELECT COUNT(*) AS pedidos_pendientes FROM ventas WHERE estatus=?',
        ['Preparando pedido'],
        (err, resultado) => {

          if (err) return res.status(500).send('Error')

          const pedidosPendientes = resultado[0].pedidos_pendientes

          connection.query(
            'SELECT COUNT(usuario) AS suma_usuario FROM usuario',
            (err, resultado) => {

              if (err) throw err

              const sumaUsuarios = resultado[0].suma_usuario

              connection.query(
                'SELECT * FROM ventas WHERE estatus!=? OR estatus=?',
                ['Entregado', null],
                (err, Data) => {

                  if (err) throw err

                  res.render('inicio_admin', {
                    login: true,
                    admin,
                    totalProductos,
                    totalVentas,
                    pedidosPendientes,
                    sumaUsuarios,
                    Data
                  })
                }
              )
            }
          )
        }
      )
    })
  })
})


//Logout
Router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('login')
})

//Home usuario
Router.get('/', (req, res) => {

  if (req.session.user) {

    const usuario = req.session.usuario

    res.render('inicio_usuario', {
      login: true,
      usuario
    })

  } else {
    res.redirect('/login')
  }
})
//Minio configuracion 
const minioClient = new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com',
  port: 443,
  useSSL: true,
  accessKey: 'TU_ACCESS_KEY',
  secretKey: 'TU_SECRET_KEY'
})
Router.get('/upload', (req, res) => {
  if (req.session.admin) {
    const admin = req.session.name
    res.render('upload', {
      login: true,
      admin: admin
    })
    /*Router.post('/producto', async(req, res)=>{
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
      
    })*/

  } else {
    res.redirect('/login')
  }
})

//Ingresamos los productos
Router.post('/producto', async (req, res) => {

  if (!req.session.admin) return res.redirect('/login')

  const { nombre_prod, descripcion, precio, precio_publico, categoria, cantidad } = req.body
  const imagen = req.files.imagen

  const img_prod = imagen.name

  try {

    await minioClient.putObject(
      'images',
      img_prod,
      imagen.data
    )

    connection.query(
      "INSERT INTO producto(img_product, nombre_prod, descripcion, precio, precio_publico, categoria, cantidad) VALUES(?,?,?,?,?,?,?)",
      [img_prod, nombre_prod, descripcion, precio, precio_publico, categoria, cantidad],
      (err) => {
        if (err) throw err
        res.redirect('/producto_admin')
      }
    )

  } catch (error) {
    console.error(error)
  }
})

//SErvicio admin
Router.get('/servicio-admin', (req, res) => {

  const admin = req.session.name

  connection.query('SELECT * FROM mantenimiento', (err, Data) => {

    if (err) throw err

    res.render('servicio-admin', {
      login: true,
      admin,
      Data
    })
  })
})

// var usuario = session.user
// var admin = session.name
// module.exports = admin
// module.exports = usuario
module.exports = Router

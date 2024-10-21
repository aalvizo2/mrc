require('dotenv').config()
const express = require('express')
const path = require('path')
const ejs = require('ejs')
const morgan = require('morgan')
const mysql = require('mysql')
const session = require('express-session')
const cookie = require('cookie-parser')
const engine = require('ejs-mate')

// Importar las rutas
const route = require('./routes/routes')
const login = require('./routes/login')
const upload = require('./routes/upload')
const registro = require('./routes/registro')
const uploads = require('./uploads')
const producto_ventas = require('./routes/producto_ventas')
const carrito = require('./routes/carrito')
const accesorios = require('./routes/accesorios')
const producto_admin = require('./routes/producto_admin')
const empty_cart = require('./routes/empty_cart')
const cart_edit = require('./routes/cart_edit')
const descuentos = require('./routes/descuentos')
const nosotros = require('./routes/nosotros')
const search = require('./routes/search')
const ventas = require('./routes/ventas')
const refacciones = require('./routes/refacciones')
const mantenimiento = require('./routes/mantenimiento')
const marcas = require('./routes/marcas')
const ventaCliente= require('./routes/venta_cliente')
const message= require('./routes/message')

const app = express()

// Configuración del motor de plantillas
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))

// Middleware
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookie())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true
}))

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'routes')))

// Rutas
app.use('/', route)
app.use('/', login)
app.use('/', accesorios)
app.use('/', registro)
app.use('/', upload)
app.use('/', uploads)
app.use('/', producto_ventas)
app.use('/', carrito)
app.use('/', producto_admin)
app.use('/', empty_cart)
app.use('/', cart_edit)
app.use('/', descuentos)
app.use('/', nosotros)
app.use('/', search)
app.use('/', ventas)
app.use('/', refacciones)
app.use('/', mantenimiento)
app.use('/', marcas)
app.use('/', ventaCliente)
app.use('/', message)



// Iniciar el servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`)
})

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).send('Página no encontrada')
})

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Algo salió mal')
})

require('dotenv').config()
const express = require('express')
const path = require('path')
const ejs = require('ejs')
const morgan = require('morgan')
const mysql = require('mysql')
const session = require('express-session')
const cookie = require('cookie-parser')
const engine = require('ejs-mate')
const { Server } = require('socket.io')
const http = require('http')


// Rutas
const route = require('./routes/routes')
const login = require('./routes/login')
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
const ventaCliente = require('./routes/venta_cliente')
const message = require('./routes/message')
const chatTest = require('./routes/chat')
const inventario = require('./routes/inventario')

const connection = require('./routes/db')

const app = express()

// EJS
app.engine('ejs', engine)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))

// Middlewares base
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookie())

// Session única
const sessionMiddleware = session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
})

app.use(sessionMiddleware)





// Static files
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'routes')))

// Rutas
app.use('/', route)
app.use('/', login)
app.use('/', accesorios)
app.use('/', registro)
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
app.use('/', chatTest)
app.use('/', inventario)

// Server HTTP + Socket
const server = http.createServer(app)
const io = new Server(server)

// Socket session share
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})

// SOCKET CHAT
io.on('connection', socket => {

    console.log('socket conectado')

    socket.on('mensaje', msg => {

        const esAdmin = msg.tipo === 'admin'
        const tipo = esAdmin ? 'admin' : 'usuario'

        const sql = `
            INSERT INTO mensajes (usuario, mensaje, tipo)
            VALUES (?, ?, ?)
        `

        connection.query(sql, [msg.usuario, msg.texto, tipo], (err, result) => {

            if (err) {
                console.error('ERROR DB', err)
                return
            }

            const data = {
                id: result.insertId,
                usuario: msg.usuario,
                texto: msg.texto,
                tipo,
                hora: new Date().toLocaleTimeString()
            }

            io.emit('mensaje', data)
        })
    })

    socket.on('historial', data => {

        let sql
        let params = []

        if (data.tipo === 'admin') {
            sql = `SELECT * FROM mensajes ORDER BY id ASC`
        } else {
            sql = `SELECT * FROM mensajes WHERE usuario=? ORDER BY id ASC`
            params = [data.usuario]
        }

        connection.query(sql, params, (err, results) => {

            if (err) {
                console.error(err)
                return
            }

            const mensajes = results.map(row => ({
                id: row.id,
                usuario: row.usuario,
                texto: row.mensaje,
                tipo: row.tipo,
                hora: new Date(row.fecha).toLocaleTimeString()
            }))

            socket.emit('historial', mensajes)
        })
    })
})

// Error 404
app.use((req, res) => {
    res.status(404).send('Página no encontrada')
})

// Error 500
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Algo salió mal')
})

// Start server
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Servidor en ejecución en puerto ${PORT}`)
})
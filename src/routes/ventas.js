const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')

Router.get('/ventas', (req, res)=>{
    const admin= req.session.name
    if(!admin){
        res.redirect('login')
    }
    connection.query('SELECT * FROM ventas', (err, ventas)=>{
        if(err) throw err 
        res.render('ventas', {
            login: true, 
            admin: admin, 
            ventas: ventas
        })
    })
})
Router.get('/detalle_venta', (req, res) => {
    const admin= req.session.name
    if(!admin){
        res.redirect('/login')
    }
    const{usuario}= req.query
    console.log(usuario)
    connection.query('SELECT * FROM ventas WHERE usuario=?', [usuario], (err, filas)=>{
        res.render('detalle_venta',{
            login: true, 
            admin: admin, 
            datos: filas
        })
    })
})
Router.post('/status', (req, res)=>{
    const {estatus, paqueteria, guia, cliente}= req.body
    console.log(estatus, paqueteria, guia, cliente)
    connection.query('UPDATE ventas SET estatus=?, guia=?, paqueteria=? WHERE cliente_name=?', [estatus, guia, paqueteria, cliente],(err)=>{
        if(err) throw err 
        console.log('Estatus actualizado')
        res.redirect('inicio_admin')
    })
})

module.exports= Router
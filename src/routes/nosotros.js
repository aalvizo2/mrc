const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')
const { format } = require('date-fns');
const es = require('date-fns/locale/es');

Router.get('/nosotros', (req, res)=>{
    const usuario= req.session.usuario
    connection.query('SELECT * FROM comentarios', (err, comentarios)=>{
        if(err) throw err
        console.log(comentarios)
        res.render('nosotros',{
            login: true,
            usuario: usuario, 
            comentarios: comentarios
        })
    })
    
})
Router.post('/comentar', (req, res)=>{
    const {usuario, comentario}= req.body
    console.log(usuario, comentario)
    const fecha_actual= new Date() 
    const Formato_letra= "EEEE, d 'de' MMMM 'de' yyyy"
    const FechaConLetra= format(fecha_actual, Formato_letra,{locale: es})
    console.log(FechaConLetra)
    connection.query('INSERT INTO comentarios(usuario, comentario, fecha) VALUES(?,?,?)', [usuario,comentario,FechaConLetra], (err)=>{
        if(err)throw err
        console.log(usuario, 'ha comentado correctamente')
        res.redirect('nosotros')
    })
})

module.exports= Router
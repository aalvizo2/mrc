const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')

Router.get('/nosotros', (req, res)=>{
    const usuario= req.session.usuario

    res.render('nosotros',{
        login: true,
        usuario: usuario
    })
})


module.exports= Router
const express= require('express')
const Router= express.Router()
var login= require('./login')


Router.get("/", (req, res)=>{
    usuario= req.session.usuario
    res.render('inicio', {
        login: true, 
        usuario: usuario
        
    })
   
    
})



module.exports= Router
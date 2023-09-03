const express= require('express')
const Router= express.Router()
var login= require('./login')


Router.get("/", (req, res)=>{
    res.render('inicio') 
   
    
})
Router.get('/login', (req, res) =>{
    res.render('login')
})
Router.get('/registro', (req, res) =>{
    res.render('registro')
})

module.exports= Router
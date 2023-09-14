const express= require('express')
require('./login')
const connection= require('./db')
const { CallTracker } = require('assert')
const Router= express.Router()
//we requiring login so we can use its session 
require('./login')

//we setting up the cart and we starting up with it
Router.post('/add-to-cart', (req, res)=>{
    console.log(req.body)
    res.json('datos insertados correctamente')
    const cart= req.body
    req.session.name= cart
    if(!req.session.cart){
        req.session.cart= []
    }else{
        cart.push(cart)
    }
})
Router.get('/cart', (req, res)=>{
    var usuario= req.session.user
    
    res.render('cart', {
        login: true, 
        usuario: usuario
    })
})

module.exports= Router
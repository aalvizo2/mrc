const express= require('express')
const Router= express.Router()
const login= require('./login');
const { error } = require('console');
const { totalmem } = require('os');
const stripe= require('stripe')('sk_test_51NoFuDHlv4JdPCt0OFDjsSoxcmHQkZCAjSk7vsFUBVFycfeCxy5HpKHUaofJogoYwzNFxBzonIvZlETbvejjIRtF00HGQq2xrn')
process.env.LANG = 'es_ES.UTF-8';
connection= require('./db')
//empty cart coding 

Router.get('/empty_cart', (req, res)=>{
    const {total}= req.query
    
    const usuario= req.session.usuario
    if(!usuario) res.redirect('/cart')
   connection.query('SELECT * FROM carrito WHERE usuario=?',[usuario], (err, datos)=>{
     if(err) throw err 
     console.log(datos)
     res.render('empty_cart', {
      login: true,
      usuario: usuario,
      total: total, 
      datos: datos
    })
  })
   
})


Router.post('/procesar-pago', async (req, res) => {
  const total = req.body.total
  const{nombre, telefono, direccion, cp, email}= req.body
  console.log(total)
  try {
    // Crea un cargo en Stripe
    const charge = await stripe.charges.create({
      amount: total*100, // El monto debe estar en centavos
      currency: 'mxn',
      source: req.body.stripeToken, // Token de tarjeta enviado desde el formulario
      description: 'Pago de ejemplo',
    });
    connection.query()
    // Aquí puedes realizar acciones adicionales después de que el pago sea exitoso
    
    res.redirect('/')
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



module.exports= Router
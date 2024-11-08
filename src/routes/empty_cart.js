const express= require('express')
const Router= express.Router()
const login= require('./login');
const { error } = require('console');
const { totalmem } = require('os');
const stripe= require('stripe')('sk_test_51NoFuDHlv4JdPCt0OFDjsSoxcmHQkZCAjSk7vsFUBVFycfeCxy5HpKHUaofJogoYwzNFxBzonIvZlETbvejjIRtF00HGQq2xrn')
process.env.LANG = 'es_ES.UTF-8';
connection= require('./db')
const { format } = require('date-fns')
const es = require('date-fns/locale/es')
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
  const usuario= req.session.usuario
  const total = req.body.total
  
  const{nombre, telefono, direccion, cp, email}= req.body
  console.log(nombre, telefono, direccion, cp, email)
  const fecha= new Date()
  const FechaConLetra= "EEEE, d, 'de', MMMM 'de' yyyy"
  const fecha_actual= format(fecha, FechaConLetra,{locale: es})
  console.log(fecha_actual)
  console.log(total)
  try {
    // Crea un cargo en Stripe
    const charge = await stripe.charges.create({
      amount: total*100, // El monto debe estar en centavos
      currency: 'mxn',
      source: req.body.stripeToken, // Token de tarjeta enviado desde el formulario
      description: 'Pago de ejemplo',
    });
    connection.query('SELECT * FROM carrito WHERE usuario=?', [usuario], (err,  producto)=>{
      for(let i=0; i<producto.length; i++){
        const productos= producto[i].producto
        const cantidad= producto[i].cantidad
        const precio= producto[i].precio
        connection.query('INSERT INTO ventas(usuario, producto, cantidad, fecha, total, cliente_dir, cliente_name, telefono, email) VALUES(?,?,?,?,?,?,?,?,?)', [usuario, productos, cantidad, fecha_actual, total, direccion, nombre, telefono, email], (err)=>{
          connection.query('SELECT * FROM producto WHERE nombre_prod=?', [productos], (err, data) => {
            if(err) throw err
            connection.query('UPDATE producto SET cantidad = cantidad - ? WHERE nombre_prod=?', [cantidad, productos], (err) =>{
              if(cantidad === 0) throw err 
              
              console.log('Datos insertados en ventas')
              connection.query('DELETE FROM carrito WHERE usuario=?', [usuario], (err)=>{
              console.log('Carrito Vaciado')
            })
            
          })
          })
          
        })
      }
    })
    // Aquí puedes realizar acciones adicionales después de que el pago sea exitoso
    res.redirect('/')
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



module.exports= Router
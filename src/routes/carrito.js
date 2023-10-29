const express= require('express')
require('./login')
const connection= require('./db')

const Router= express.Router()
//we requiring login so we can use its session 
require('./login')

//we setting up the cart and we starting up with it
Router.post('/add-to-cart', (req, res)=>{
    const usuario= req.session.usuario
    if(!usuario){
        res.redirect('login')
    }else{
        const {img_product}= req.body
        const {nombre_prod}= req.body
        const{precio_publico}= req.body
        const {cantidad}= req.body
        const fecha= Date.now()
        const total= precio_publico * cantidad
        
        
        connection.query('SELECT * FROM carrito WHERE usuario=? AND producto=?', [usuario, nombre_prod], (err, resultado)=>{
            
            if(resultado.length === 0){
                connection.query("INSERT INTO carrito (img_prod, usuario, producto, precio, cantidad, fecha, total) VALUES(?,?,?,?,?,?, ?)", [img_product, usuario, nombre_prod, precio_publico, cantidad, fecha, total], (err)=>{
                    if(err) throw err 
                    console.log('se han agregado correctamente los productos al carrito')
                    res.redirect('cart')
                })
            }else{
                
                connection.query('UPDATE carrito SET cantidad= cantidad+ ?, total= precio*cantidad WHERE producto=? AND usuario=?', [cantidad, nombre_prod, usuario], (err)=>{
                    if(err) throw err 
                    res.redirect('cart')
                })
                
            }
        })
      
    }
})
Router.get('/cart', async(req, res)=>{
    usuario= req.session.usuario
    
    const consulta_prod= 'SELECT * FROM carrito WHERE usuario=?'
    connection.query(consulta_prod, [usuario], (err, consulta)=>{
        
        if(err){
            console.err(err)
        }else{
            const productos= consulta
            console.log(consulta)
            connection.query('SELECT SUM(total) AS suma FROM carrito WHERE usuario=?', [usuario], (err, suma)=>{
                if(err){
                    console.err(err)
                }else  if (suma && suma[0] && suma[0].suma !== null){
                    
                   const total= suma[0].suma
                   
                   
                   connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
                      const contador= objeto[0].objeto
                      res.render('cart', {
                        login: true, 
                        usuario: usuario, 
                        fila: productos, 
                        total: total, 
                        objeto: contador
                       })
                   })
                   
                }
            })
        }
    })
  
})

Router.get('/delete/:id', (req, res) =>{
    const {id}= req.params
    connection.query('DELETE FROM carrito WHERE id=?', [id], (res, err)=>{
      
      console.log('se ha eliminado')
    })
    if(id){
        res.redirect('/cart')
    }
})



module.exports= Router
const express= require('express')
const Router= express.Router()
const login= require('./login')
const connection= require('./db')
const Minio= require('minio')



//we gonna configurate minio 
const minioClient= new Minio.Client({
  endPoint: 'g7l6.la1.idrivee2-91.com', 
  port: 443, 
  useSSL: true, 
  accessKey: 'Yll2kDG0a8R0OvLqqpDa',
  secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
})

//we loading our accesorios page 
Router.get('/accesorios', (req, res)=>{
   usuario= req.session.usuario
   connection.query('SELECT * FROM producto WHERE categoria="accesorios"', (err, rows)=>{
     
     connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
      const contador= objeto[0].objeto
      const imagenes= rows.map(item => item.img_product)
      console.log(imagenes)
     

        Promise.all(imagenes.map((image) =>
           new Promise((resolve, reject) =>{
             minioClient.presignedUrl('GET', 'images', image, 24*60*60, (err, url) =>{
               if(err){
                 reject(err)
               }else{
                 resolve(url)
               }
             })
           })
       ))
       .then((urls) => {
         console.log('Urls generadas', urls)
         res.render('accesorios', {
          login: true, 
          usuario: usuario, 
          datos: rows,
          objeto: contador, 
          urls: urls
         })
       })
       
      
      
     })
    
   })
})

module.exports= Router
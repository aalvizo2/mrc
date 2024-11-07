const express= require('express')
const Router= express.Router()
const connection= require('./db')
const login= require('./login')
const Minio= require('minio')

//we gonna configurate minio 
const minioClient= new Minio.Client({
    endPoint: 'g7l6.la1.idrivee2-91.com', 
    port: 443, 
    useSSL: true, 
    accessKey: 'Yll2kDG0a8R0OvLqqpDa',
    secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
  })


Router.get('/refacciones', (req, res)=>{
    usuario= req.session.usuario
    connection.query('SELECT * FROM producto WHERE categoria="refacciones"', (err, refacciones)=>{
        connection.query('SELECT SUM (cantidad) as objeto FROM carrito WHERE usuario=?', [usuario], (err, objeto)=>{
            const imagenes= refacciones.map(item=> item.img_product)
            const contador= objeto[0].objeto

            Promise.all(imagenes.map((imagen) =>
               new Promise((resolve, reject) => {
                minioClient.presignedUrl('GET', 'images', imagen, 24*60*60, (err, url)=> {
                    if(err){
                        reject(err)
                    }else{
                        resolve(url)
                    }
                })
               })
            ))
            .then((urls) => {
                res.render('refacciones', {
                    login: true, 
                    usuario: usuario, 
                    datos: refacciones,
                    objeto: contador, 
                    urls: urls
                 })
            })
            
        })      
        
    })
})


module.exports= Router
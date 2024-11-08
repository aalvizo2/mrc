const Minio= require('minio')



const minioClient= new Minio.Client({
    endPoint: 'g7l6.la1.idrivee2-91.com', 
    port: 443, 
    useSSL: true, 
    accessKey: 'Yll2kDG0a8R0OvLqqpDa',
    secretKey: 'v4eaYdVa9NnrOibhLxEI21UQJV9oHSUEhiYJot5s'
  })



module.exports= minioClient
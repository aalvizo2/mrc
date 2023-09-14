const mysql= require('mysql')

// we creating a connection 
const connection= mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '123456789', 
    database: 'mrc'
})
connection.connect((err)=>{
    if(err) throw err
    console.log('conectado a la base de datos de mrc ')
})


module.exports= connection
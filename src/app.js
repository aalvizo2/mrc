const express= require('express');
const app= express();
const path= require('path');
const ejs= require('ejs');
const html= require('html')
const morgan= require('morgan');
const mysql= require('mysql')
const session= require('express-session')
const cookie= require('cookie-parser')
const route= require('./routes/routes')
const login= require('./routes/login')
const upload= require('./routes/upload')
const registro= require('../src/routes/registro')
const engine= require('ejs-mate')
const uploads= require('./uploads')
const producto_ventas= require('./routes/producto_ventas')
const carrito= require('./routes/carrito')
const accesorios= require('./routes/accesorios')


app.engine('ejs', engine)
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
   secret: 'secret',
   resave: true,
   saveUninitialized: true
}))

 if(!app){
    console.log('there was some problem connecting port')
 }else{
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'public'));
    app.use(morgan('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'routes')))
    
    app.listen(app.get('port'), ()=>{
          //routes
          app.use('/', route)
          app.use('/', login)
          app.use('/', accesorios)
          app.use('/', registro)
          app.use('/', upload)
          app.use('/', uploads)
          app.use('/', producto_ventas)
          app.use('/', carrito)
          
          app.use(cookie())
          console.log('server running on port 3000')
      })
    }
    // we shall open up a session on login if activated

//middlewares


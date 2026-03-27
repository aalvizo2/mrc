const express= require('express')
const router= express.Router()
router.use(express.urlencoded({extended: true}))
var mysql= require('mysql')
const bcrypt= require('bcrypt')
const connection= require('./db')
//we loading register page and rendering it
router.get('/registro', (req, res) =>{
  res.render('registro')
})
router.post('/registro', async (req, res) => {
  try {
    const { usuario, pass, email } = req.body;

    console.log(usuario, pass, email);

    if (!usuario || !pass || !email) {
      return res.send('Favor de insertar todos los datos');
    }

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    connection.query(
      'INSERT INTO usuario (usuario, pass, email) VALUES (?, ?, ?)',
      [usuario, hashedPassword, email],
      (err, rows) => {
        if (err) throw err;

        res.render('login', {
          alert: true,
          alertMessage: "Usuario Registrado Correctamente",
          alertIcon: 'success',
          showConfirmButton: true,
          timer: false,
          ruta: 'login'
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.send('Error en el servidor');
  }
});






module.exports= router

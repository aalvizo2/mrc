const express = require('express');
const router = express.Router();
const connection = require('./db');
const XLSX = require('xlsx');
const multer = require('multer');

// 🔥 MULTER CONFIG (memoria, no disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/inventario', (req, res) => {
    const admin = req.session.name;

    if (!admin) return res.redirect('/');

    connection.query('SELECT * FROM inventario', (err, result) => {
        if (err) console.error(err);

        res.render('inventario', {
            login: true,
            admin,
            data: result
        });
    });
});

router.post('/inventario/upload', upload.single('excel'), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió archivo' });
        }

        // 🔥 leer Excel desde buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        let insertados = 0;
        let errores = 0;

        for (let row of rows) {

            const producto = row.Producto;
            const descripcion = row.Descripcion || '';
            const cantidad = parseInt(row.Cantidad || 0);
            const precio_publico = parseFloat(row.Precio || 0);
            const precio_descuento = parseFloat(row.Descuento || 0) || null;
            const marca = row.Marca || '';
            const codigo_barras= row.Codigo_Baras || 'Codigo de barras';

            if (!producto) {
                errores++;
                continue;
            }

            try {
                await new Promise((resolve, reject) => {
                    connection.query(`
                        INSERT INTO inventario
                        (id, producto, descripcion, cantidad, precio_publico, precio_descuento, marca, codigo_barras)
                        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        producto,
                        descripcion,
                        cantidad,
                        precio_publico,
                        precio_descuento,
                        marca,
                        codigo_barras
                    ], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                insertados++;

            } catch (e) {
                errores++;
            }
        }

        return res.json({
            insertados,
            errores,
            roast: errores === 0 ? "Todo bien " : "Se dejó subir "
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error procesando archivo' });
    }
});


//Editar inventario 
router.post('/inventario/update-field', (req, res) => {
    const { id, field, value } = req.body

    console.log('datos que se van a enviar', req.body)

    try {
        const query = `
        UPDATE inventario SET ??=? WHERE id=?
        `

        connection.query(query, [field, value, id], (err) => {
            if (err) {
                return res.json({ ok: false })
            }

            res.json({ ok: true })
        })

    } catch (error) {
        res.json({ ok: false })
    }
})



//Eliminar
router.delete('/inventario/delete', (req, res) =>{
    const {id} = req.body



    const query = "DELETE FROM inventario WHERE id = ?"

    connection.query(query, [id], (err) => {
        if (err) {
            return res.json({ ok: false })
        }

        res.json({ ok: true })
    })
})



router.post('/inventario', (req, res) =>{
    const {
        producto, 
        descripcion, 
        cantidad, 
        precio_publico, 
        precio_descuento, 
        marca, 
        codigo_barras
    }= req.body


    const sql=`
        INSERT INTO inventario 
        (producto,
         descripcion, 
         cantidad, 
         precio_publico,
         precio_descuento,
         marca,
         codigo_barras
        )VALUES(?,?,?,?,?,?,?)
    `

    connection.query(sql,
        [
            producto,
            descripcion,
            cantidad,
            precio_publico,
            precio_descuento,
            marca,
            codigo_barras
        ],
        (err)=>{
          if(err){
            console.error('error al insertar los datos', err)
          }
          res.json({
            message: 'Datos insertados correctamente'
          })
        
    })
})

module.exports = router
const { cache } = require('ejs') // Esto puede ser innecesario si no lo estás usando
const minioClient = require('./minioClient')

const urlCache = {}

function getSingleImageUrl(imagen) {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const cachedUrl = urlCache[imagen]

    // Verifica si la URL está en caché y si aún no ha expirado
    if (cachedUrl && cachedUrl.expiresAt > now) {
      console.log('Usando URL de caché:', cachedUrl.url)
      return resolve(cachedUrl.url) // Devuelve la URL desde el caché
    }

    // Si no está en caché o la URL ha expirado, genera una nueva URL firmada
    minioClient.presignedUrl('GET', 'images', imagen, 60, (err, url) => { // Expiración de 1 minuto
      if (err) {
        return reject(err) // Si hay un error, lo rechazamos
      }

      // Almacena la nueva URL en el caché con la fecha de expiración
      urlCache[imagen] = {
        url,
        expiresAt: now + 60 * 1000 // La URL expirará en 1 minuto
      }

      console.log('Generando nueva URL:', url)
      resolve(url) // Devuelve la nueva URL generada
    })
  })
}

module.exports = getSingleImageUrl

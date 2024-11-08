const minioClient= require('./minioClient')


const urlCache= {}

function getImageUrl(imagen) {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const cachedUrl = urlCache[imagen]

    // Verifica si la URL en caché sigue vigente
    if (cachedUrl && cachedUrl.expiresAt > now) {
      return resolve(cachedUrl.url)
    }

    // Genera una nueva URL firmada si no existe o ya expiró
    minioClient.presignedUrl('GET', 'images', imagen, 60, (err, url) => { // Expira en 1 minuto
      if (err) {
        return reject(err)
      }

      // Almacena la nueva URL en el caché con el tiempo de expiración
      urlCache[imagen] = {
        url,
        expiresAt: now + 60 * 1000 // Expiración en 1 minuto
      }

      console.log(`Nueva URL generada para ${imagen}:`, url)
      console.log(`Expira en: ${new Date(urlCache[imagen].expiresAt).toLocaleTimeString()}`)

      resolve(url)
    })
  })
}


module.exports= getImageUrl
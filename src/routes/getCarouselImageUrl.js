const minioClient= require('./minioClient')



const urlCache= {}


function getCarouselUrl(imagen) {
    return new Promise((resolve, reject) => {
        const now = Date.now()
        const cachedUrl = urlCache[imagen]

        if (cachedUrl && cachedUrl.expiresAt > now) {
            return resolve(cachedUrl.url)
        }

        minioClient.presignedUrl(
            'GET',
            'carousel',
            imagen,
            60,
            (err, url) => {
                if (err) return reject(err)

                urlCache[imagen] = {
                    url,
                    expiresAt: now + (1000 * 60 * 60 * 24)
                }

                resolve(url)
            }
        )
    })
}


module.exports= getCarouselUrl
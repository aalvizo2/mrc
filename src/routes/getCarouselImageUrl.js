const minioClient= require('./minioClient')



const urlCache= {}


function getCarouselUrl(imagen) {
    return new Promise((resolve, reject) => {
        minioClient.presignedUrl(
            'GET',
            'carousel',
            imagen,
            60,
            (err, url) => {
                if (err) return reject(err)
                resolve(url)
            }
        )
    })
}


module.exports= getCarouselUrl
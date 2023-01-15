const axios = require('axios');
const sharp = require('sharp');
const { convertTo64 } = require('./utils');
const crypto = require('crypto')
const https = require("https");

const proxy = [
    "117.160.250.138:81",
    "162.62.81.27:81",
    //"117.74.65.29:81"
]

const getAnime = (image) => {
    return new Promise((resolve, reject) => {
        let data_ = JSON.stringify({
            "busiId": "different_dimension_me_img_entry",
            "images": [image],
            "extra": "{\"face_rects\":[],\"version\":2,\"language\":\"en\",\"platform\":\"web\",\"data_report\":{\"parent_trace_id\":\"e249ff20-6a1e-16cb-0750-c7fa37407d10\",\"root_channel\":\"\",\"level\":0}}",
        })
        let signature = crypto.createHash('md5').update("https://h5.tu.qq.com" + data_.length + "HQ31X02e").digest("hex")
        let ip = proxy[Math.floor(Math.random()*proxy.length)]
        console.log(ip)
        axios({
            method:'post',
            url:'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
            headers: {
                'Host': 'ai.tu.qq.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://h5.tu.qq.com',
                'x-sign-value':  signature,
                'x-sign-version': 'v1',
            },
            proxy: {
                protocol: 'http',
                host: ip.split(":")[0],
                port: ip.split(":")[1],
            },
            timeout: 480000,
            httpsAgent: new https.Agent({ keepAlive: true }),
            data: data_
        })
            .then((data) => {
                if (data.data.code !== 0) return reject(data.data);
                resolve(data.data);
            })
            .catch(err => {
                reject(err);
            });
    });
}

const resizeImage = (image) => {
    return new Promise((resolve, reject) => {
        sharp(new Buffer.from(image, 'base64'))
            .resize(720, 1080)
            .toFormat('jpeg')
            .toBuffer()
            .then(img => resolve(img.toString('base64')))
            .catch(err => reject(err));
    });
}

const cropImage = (image) => {
    return new Promise((resolve, reject) => {
        sharp(new Buffer.from(image, 'base64'))
            .extract({left: 508, top: 25, width: 470, height: 702})
            .toBuffer()
            .then(img => resolve(img.toString('base64')))
            .catch(err => reject(err));
    });
}
/**
 * Allows you to transform an image to apply an anime / manga style
 *
 * @param {objet} args
 * @param {string} args.photo - Image to transform, can be image path, image url or base64 image
 * @param {string} args.destinyFolder - Path to save the transformed image, if not provided the image will be delivered in base64
 * @return {Promise<string>} Transformed image
 */
const SelfieToAnime = (args) => {
    return new Promise(async (resolve, reject) => {
        if (typeof args.photo === 'undefined' || args.photo === '') return reject('An image must be provided to transform...');

        const selfie = args.photo;//await convertTo64(args.photo);
        //const base64Selfie = selfie.split(';base64,').pop();
        const resizedImage = await resizeImage(selfie);
        getAnime(resizedImage)
            .then(async (data) => {

                if(data.code === 0 && data.extra !== undefined && data.extra !== ''){
                    const extra = JSON.parse(data.extra);
                    const image = extra.img_urls[0];
                    const image64 = await convertTo64(image)
                    const imageCrop = await cropImage(image64)
                    resolve({
                        image: imageCrop,
                        url: image,
                    });
                } else {
                    reject('An error occurred while trying to transform the image 1');
                }
            })
            .catch(err => {
                console.log('error', err);
                console.log('error', err.message);
                reject(err);
            });
    });
}

module.exports = {
    SelfieToAnime
};

const streamifier = require('streamifier');
const cloudinary = require('./cloudinary');

const uploadToCloudinary = (fileBuffer, folder) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                resolve(result.secure_url);

            }
        );

        streamifier
            .createReadStream(fileBuffer)
            .pipe(stream);

    });

};

module.exports = uploadToCloudinary;
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                'Only JPG, JPEG, PNG, and PDF files are allowed.'
            ),
            false
        );

    }

};

const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },

    fileFilter

});

module.exports = upload;
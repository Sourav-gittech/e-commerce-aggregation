const multer = require("multer");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/avi': 'avi',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const ckeckType = FILE_TYPE_MAP[file.mimetype];

        let uploadError = new Error('Invalid file type');

        if (ckeckType) {
            uploadError = null;
        }

        cb(uploadError, 'uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(" ").join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];

        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const Upload = multer({ storage });

module.exports = Upload;
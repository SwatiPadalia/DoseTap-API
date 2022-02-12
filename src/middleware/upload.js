const multer = require("multer");

const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb("Please upload only csv file.", false);
    }
};

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + "/uploads/");
    },
    filename: (req, file, cb) => {
        console.log("🚀 ~ file: upload.js ~ line 16 ~ file", file)
        console.log(file.originalname);
        cb(null, `${Date.now()}-medicine-${file.originalname}`);
    },
});

var uploadFile = multer({ storage: storage, fileFilter: csvFilter });
export default uploadFile;
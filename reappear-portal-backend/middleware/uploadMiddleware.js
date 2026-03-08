import multer from 'multer';

// Configure where and how to save the file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Saves it to the folder we just created!
    },
    filename: function (req, file, cb) {
        // Adds a timestamp so every filename is 100% unique
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Security: Only allow PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});
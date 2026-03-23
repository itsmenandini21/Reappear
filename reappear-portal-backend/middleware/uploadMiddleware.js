import multer from 'multer';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure where and how to save the file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder); // Saves it securely using absolute paths
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
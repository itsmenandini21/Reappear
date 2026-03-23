import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary with keys
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure where and how to save the file
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'reappear-pyqs', // The folder name in your Cloudinary account
        format: async (req, file) => 'pdf', // strictly save as pdf
        public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`
    },
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
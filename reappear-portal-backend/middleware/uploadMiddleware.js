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
        // Dynamically get format from mimetype
        format: async (req, file) => {
            if (file.mimetype === 'image/png') return 'png';
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') return 'jpg';
            return 'pdf'; // Default fallback
        },
        public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`
    },
});

// Security: Only allow PDF files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, PNG, and JPEG files are allowed!'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});
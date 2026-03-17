import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors'; 

import path from 'path';
import { fileURLToPath } from 'url';

// 1. IMPORT ALL YOUR ROUTES HERE
import subjectRoutes from './routes/subjectRoutes.js';
import examRoutes from './routes/examRoutes.js';
import peerRoutes from './routes/peerRoutes.js'; 
import pyqRoutes from './routes/pyqRoutes.js';   
import facultyRoutes from './routes/facultyRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js'; // <-- FIX 4: Imported your auth routes!
import announcementRoutes from './routes/announcementRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import {protect,admin} from "./middleware/authMiddleware.js"
import reappearRoutes from "./routes/reappearRoutes.js";

dotenv.config();
connectDb();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(cors({
//     origin: 'http://localhost:3000', 
//     credentials: true
// }));
app.use(cors()); // Allow all origins for development. Adjust in production!

app.use(express.json()); 

// 2. TELL EXPRESS TO USE ALL YOUR ROUTES HERE
app.use('/api/auth', authRoutes); // <-- FIX 4: Tells the server to use the routes!
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/peers', peerRoutes); 
app.use('/api/pyq', pyqRoutes);    
app.use('/api/faculty', facultyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/reappear",reappearRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
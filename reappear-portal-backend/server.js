import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors'; 

// 1. IMPORT ALL YOUR ROUTES HERE
import subjectRoutes from './routes/subjectRoutes.js';
import examRoutes from './routes/examRoutes.js';
import peerRoutes from './routes/peerRoutes.js'; 
import pyqRoutes from './routes/pyqRoutes.js';   
import facultyRoutes from './routes/facultyRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js'; // <-- FIX 4: Imported your auth routes!

dotenv.config();
connectDb();

const app = express();

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import express from 'express';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import cors from 'cors'; 

// 1. IMPORT ALL YOUR ROUTES HERE
import subjectRoutes from './routes/subjectRoutes.js';
import examRoutes from './routes/examRoutes.js';
import peerRoutes from './routes/peerRoutes.js'; // <-- Make sure this is here!
import pyqRoutes from './routes/pyqRoutes.js';   // <-- Make sure this is here!
import facultyRoutes from './routes/facultyRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

dotenv.config();
connectDb();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));

app.use(express.json()); 

// 2. TELL EXPRESS TO USE ALL YOUR ROUTES HERE
app.use('/api/subjects', subjectRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/peers', peerRoutes); // <-- Connects the peers frontend to the peers backend!
app.use('/api/pyq', pyqRoutes);    // <-- Connects the PYQ frontend to the PYQ backend!
app.use('/api/faculty', facultyRoutes);
app.use('/api/applications', applicationRoutes);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
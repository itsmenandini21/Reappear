import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './reappear-portal-backend/.env' });

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admin = await User.findOne({ email: 'admin.nitkkr@gmail.com' });
    console.log("Admin User:", admin);
    process.exit(0);
}).catch(console.error);

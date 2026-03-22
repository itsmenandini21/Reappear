import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './reappear-portal-backend/.env' });

const userSchema = new mongoose.Schema({ email: String, password: String, role: String }, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    let admin = await User.findOne({ role: 'admin' });
    if (admin) {
        console.log("Found admin:", admin.email);
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        await admin.save();
        console.log("Admin password successfully updated to bcrypt hashed 'admin123'");
    } else {
        console.log("No admin found.");
    }
    process.exit(0);
}).catch(console.error);

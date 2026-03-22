import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './reappear-portal-backend/.env' });

const userSchema = new mongoose.Schema({ email: String, password: String, role: String }, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    let admin = await User.findOne({ email: 'admin.nitkkr@gmail.com' });
    if (admin) {
        console.log("Found admin user!");
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123456', salt);
        admin.role = 'admin'; // ensure they have the admin role for the layout guard
        await admin.save();
        console.log("SUCCESS: admin.nitkkr@gmail.com password permanently set to: admin123456");
    } else {
        console.log("User admin.nitkkr@gmail.com does NOT exist in the database!");
    }
    process.exit(0);
}).catch(console.error);

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ name: 'Nandini Mehrotra' });
    if (!user) throw new Error("User not found");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    console.log("Got token.");

    const res = await fetch('http://localhost:5001/api/peers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Peers Status:", res.status);
    console.log("Peers Response:", await res.text());

    const res2 = await fetch(`http://localhost:5001/api/messages/conversations/${user.name}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Messages Status:", res2.status);
    console.log("Messages Response:", await res2.text());

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();

import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
});

const Notice=mongoose.model("Notice",noticeSchema);
export default Notice;
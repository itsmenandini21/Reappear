import express from "express"
import dotenv from "dotenv"
import { configDotenv } from "dotenv";
import cors from "cors"
import connectDb from "./config/db.js";
import router from "./routes/authRoutes.js";

const app=express();
configDotenv();
connectDb();

app.use(cors())
app.use(express.json());
app.use("/api/auth",router);

app.get("/",(req,res)=>{
    res.send("Reappear API is running")
})

const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`server running on ${port}`);
})
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDb from "./config/db.js";

const app=express();
dotenv.config()
connectDb();

app.use(cors())
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Reappear API is running")
})

const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`server running on ${port}`);
})
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.js"

//Generate Token-
const generateToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"30d"})
}

//REGISTER

const registerUser=async (req,res)=>{
    const {name,email,password,rollNumber,branch,currentSemester}=req.body;
    console.log("1.req received")
    console.log(`${name}  ${email}  ${rollNumber}  ${branch}  ${currentSemester}`);
    try{
        const userExists=await User.findOne({email});
        console.log("2.checked")
        if(userExists){
            return res.status(400).json({message:"User already exists"})
        }
        console.log("3.user not exists")
        const user=await User.create({name,email,password,role,rollNumber,branch,currentSemester});
        console.log("4.user created")

        if(user){
            res.status(200).json({
                _id:user._id,
                name:user.name,
                token:generateToken(user._id)
            })
        }
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

//LOGIN

const loginUser=async (req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await User.findOne({email});
        if(user && (await bcrypt.compare(password,user.password))){
            res.status(200).json({
                _id:user._id,
                name:user.name,
                token:generateToken(user._id)

            })
        }
        else{
            return res.status(400).json({message:"Incorrect email or password"})
        }
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

export {registerUser,loginUser};

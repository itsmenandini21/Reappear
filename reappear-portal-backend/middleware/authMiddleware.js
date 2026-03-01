import User from "../models/user";
import jwt from "jsonwebtoken";

//Security(so that only logged in users can logged in)
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && (req.headers.authorization.startsWith("Bearer"))) {
        try {
            token=req.headers.authorzation.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();

        }
        catch (error) {
            res.status(401).json({message:"Token failed"});
            
        }

    }
    if (!token) {
        res.status(401).json({message:"User is not authorized"});
    }
}

//For Admin

const admin=async (req,res,next)=>{
    if(req.user && req.user.role=="admin"){
        next();
    }
    else{
        res.status(401).json({message:"Not authorized as Admin"});

    }
}
export {protect,admin};
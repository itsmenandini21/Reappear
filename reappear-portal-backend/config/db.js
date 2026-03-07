import mongoose from "mongoose";

const connectDb= async ()=>{
    try{
        const encodedPassword=encodeURIComponent(process.env.Mongo_password)
        const mongo_URL=`mongodb+srv://${process.env.Mongo_User}:${encodedPassword}@${process.env.Mongo_cluster}/?appName=${process.env.Mongo_app}`;
        await mongoose.connect(mongo_URL);
        console.log("Database connected successfully");
    }
    catch(error){
        console.log(`error occured: ${error.message}`)
        process.exit(1);
    }
}
 export default connectDb;
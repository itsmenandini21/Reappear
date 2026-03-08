// import mongoose from "mongoose";

// const connectDb= async ()=>{
//     try{
//         const encodedPassword=encodeURIComponent(process.env.Mongo_password)
//         const mongo_URL=`mongodb+srv://${process.env.Mongo_User}:${encodedPassword}@${process.env.Mongo_cluster}/${process.env.Mongo_Db}/?appName=${process.env.Mongo_app}`;
//         await mongoose.connect(mongo_URL);
//         console.log("Database connected successfully");
//     }
//     catch(error){
//         console.log(`error occured: ${error.message}`)
//         process.exit(1);
//     }
// }
//  export default connectDb;

import mongoose from "mongoose";

const connectDb = async () => {
    try {
        // This will now look directly at the MONGO_URI in your .env file!
        await mongoose.connect(process.env.MONGO_URI);
        console.log(process.env.MONGO_URI);
        console.log("Database connected successfully");
    }
    catch(error) {
        console.log(`error occured: ${error.message}`);
        process.exit(1);
    }
}

export default connectDb;
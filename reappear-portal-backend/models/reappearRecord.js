import mongoose from "mongoose"
 const reappearRecordSchema=new mongoose.Schema({
    student:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    subject:{type:mongoose.Schema.Types.ObjectId,ref:"subject",required:true},
    status:{
        type:String,
        enum:["cleared","pending","in-progress"],
        default:"pending"
    },
    attemptCount:{type:Number,default:1},
    feesPaid:{
        type:Boolean,
        deafault:false
    },
    roomAllocation:{type:String},
    examDate:{
        type:Date
    },
 },{timestamps:true})

 const reappearRecord=mongoose.model("reappearRecord",reappearRecordSchema);
 export default reappearRecord;
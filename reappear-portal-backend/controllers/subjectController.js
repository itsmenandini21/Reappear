import Subject from "../models/subject.js";

//Admin work
const addSubject=async (req,res)=>{
    try{
        const {subjectCode,subjectName,department,credits,syllabusURL,currentFaculty}=req.body;
        const subExists=await Subject.findOne({subjectCode});
        if(subExists){
            return res.status(401).json({message:"Subject already exists"});
        }
        const subject=await Subject.create({subjectCode,subjectName,department,credits,syllabusURL,currentFaculty});
        res.status(200).json(subject);
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
}

const updateSubject=async (req,res)=>{
    try{
        const subject=await Subject.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true,runValidators:true}
        )
        if(!subject){
            return res.status(400).json({message:"Subject not found"});
        }
        return res.status(200).json({
            message:"Subject updated successfully",
            subject
        });
    }
    catch(error){
        return res.status(500).json({message:error.message});
    }
}

//by student,admin

const getSubject=async (req,res)=>{
    try{
        const {subjectCode,branch,semester}=req.query;
        let query={};
        if(branch) query.branch=branch;
        if(semester) query.semester=semester;
        if(subjectCode) query.subjectCode=subjectCode;

        const subjects=await Subject.find(query);
        res.json(subjects);
    }
    catch(error){
        res.status(500).json({message:error.message});
    }

}

export {addSubject,updateSubject,getSubject};
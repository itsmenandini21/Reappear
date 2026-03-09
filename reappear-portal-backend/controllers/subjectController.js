import Subject from "../models/subject.js";

//Add faculty form
const getSubjectsBySemestersAndDept = async (req, res) => {
    try {
        const { semesters,department } = req.query;

        // Agar semesters nahi bheje toh empty array bhej do
        if (!semesters) {
            return res.status(200).json([]);
        }

        // semesters "1,3,5" string mein aayenge, unhe array of numbers banao
        const semArray = semesters.split(',').map(Number);

        // MongoDB query: Un subjects ko dhundo jinka semester semArray mein ho
        const subjects = await Subject.find({ 
            semester: { $in: semArray },
            department:department
        }).sort({ semester: 1 }); // Sort by semester for clean UI

        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

// subjectController.js

const getSubjectsByDept = async (req, res) => {
    try {
        const { department } = req.query; // URL se department uthayega

        let filter = {};
        if (department) {
            filter.department = department; // Agar dept aaya hai toh filter lagao
        }

        const subjects = await Subject.find(filter).sort({ semester: 1 });
        
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};

//Admin work
const addSubject=async (req,res)=>{
    try{
        const {subjectCode,subjectName,semester,department,credits}=req.body;
        const subExists=await Subject.findOne({subjectCode});
        if(subExists){
            return res.status(401).json({message:"Subject already exists"});
        }
        const subject=await Subject.create({subjectCode,subjectName,semester,department,credits});
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

//by student
const getAllSubjects= async (req,res)=>{
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (err) { res.status(500).json(err); }
}

const deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.status(200).json("Deleted");
    } catch (err) { res.status(500).json(err); }
};

export {addSubject,updateSubject,getSubjectsBySemestersAndDept,getSubjectsByDept,deleteSubject,getAllSubjects};
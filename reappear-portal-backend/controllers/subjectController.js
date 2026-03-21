import Subject from "../models/subject.js";

// @desc    Get Subjects dynamically filtered by Semester Array, Department, and strictly Branch.
const getSubjectsBySemestersAndDept = async (req, res) => {
    try {
        const { semesters, department, branch } = req.query;

        // Agar semesters nahi bheje toh empty array bhej do
        if (!semesters) {
            return res.status(200).json([]);
        }

        const semArray = semesters.split(',').map(Number);
        
        let queryArgs = {
            semester: { $in: semArray },
            department: department
        };
        
        if (branch) queryArgs.branch = branch;

        const subjects = await Subject.find(queryArgs).sort({ semester: 1 });
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

// @desc    Get an array of unique Departments mapped within the Subject Schema
// @route   GET /api/subjects/departments
const getUniqueDepartments = async (req, res) => {
    try {
        const departments = await Subject.distinct("department");
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: "Failed to query Schema Departments", error: error.message });
    }
};

// @desc    Get an array of unique Branches bound to a specific Department
// @route   GET /api/subjects/branches?department=X
const getBranchesByDepartment = async (req, res) => {
    try {
        const { department } = req.query;
        if (!department) return res.status(400).json({ message: "Target Department required" });
        
        const branches = await Subject.distinct("branch", { department });
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: "Failed to query Schema Branches", error: error.message });
    }
};

// @desc    Get an array of distinct active semesters bound to a Dept + Branch
// @route   GET /api/subjects/semesters/distinct?department=X&branch=Y
const getSemestersByDeptAndBranch = async (req, res) => {
    try {
        const { department, branch } = req.query;
        if (!department || !branch) return res.status(400).json({ message: "Dept and Branch required" });

        const sems = await Subject.distinct("semester", { department, branch });
        res.status(200).json(sems.sort((a,b) => a - b));
    } catch (error) {
        res.status(500).json({ message: "Failed to query Schema Semesters", error: error.message });
    }
};

//Admin work
const addSubject=async (req,res)=>{
    try{
        const {subjectCode,subjectName,semester,department,branch,credits}=req.body;
        const subExists=await Subject.findOne({subjectCode});
        if(subExists){
            return res.status(401).json({message:"Subject already exists"});
        }
        const subject=await Subject.create({subjectCode,subjectName,semester,department,branch,credits});
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

export {
    addSubject,
    updateSubject,
    getSubjectsBySemestersAndDept,
    getSubjectsByDept,
    deleteSubject,
    getAllSubjects,
    getUniqueDepartments,
    getBranchesByDepartment,
    getSemestersByDeptAndBranch
};
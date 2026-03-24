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

const getSubjectsByDept = async (req, res) => {
    try {
        const { department } = req.query; 

        let filter = {};
        if (department) {
            filter.department = department;
        }

        const subjects = await Subject.find(filter).sort({ semester: 1 });
        
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subjects", error: error.message });
    }
};


// GET /api/subjects/departments
const getUniqueDepartments = async (req, res) => {
    try {
        const dbDepartments = await Subject.distinct("department");
        
        const predefined = [
            "Computer Engineering",
            "Electronics and Communication Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Civil Engineering",
            "Energy Science and Engineering"
        ];
        
        // Merge without duplicates
        const allDepts = Array.from(new Set([...predefined, ...dbDepartments]));
        
        res.status(200).json(allDepts.sort());
    } catch (error) {
        res.status(500).json({ message: "Failed to query Schema Departments", error: error.message });
    }
};


// GET /api/subjects/branches?department=X
const getBranchesByDepartment = async (req, res) => {
    try {
        const { department } = req.query;
        let queryArgs = {};
        
        if (department && department !== 'All' && department !== 'undefined') {
            queryArgs.department = department;
        }
        
        const dbBranches = await Subject.distinct("branch", queryArgs);
        
        const branchMap = {
            "Computer Engineering": [
                "Computer Science",
                "Information Technology",
                "Artificial Intelligence and Machine Learning",
                "Artificial Intelligence and Data Science",
                "Mathematics and Computing"
            ],
            "Electronics and Communication Engineering": [
                "Electronics & Communication Engineering (ECE)",
                "Industrial Internet of Things (IIoT)",
                "Microelectronics and VLSI Engineering"
            ],
            "Mechanical Engineering": [
                "Mechanical Engineering",
                "Production & Industrial Engineering",
                "Robotics & Automation"
            ],
            "Electrical Engineering": [
                "Electrical Engineering"
            ],
            "Civil Engineering": [
                "Civil Engineering"
            ],
            "Energy Science and Engineering": [
                "Sustainable Energy Technologies"
            ]
        };
        
        let predefined = [];
        if (department && branchMap[department]) {
            predefined = branchMap[department];
        }
        
        const allBranches = Array.from(new Set([...predefined, ...dbBranches]));
        
        res.status(200).json(allBranches.sort());
    } catch (error) {
        res.status(500).json({ message: "Failed to query Schema Branches", error: error.message });
    }
};

// GET /api/subjects/semesters/distinct?department=X&branch=Y
const getSemestersByDeptAndBranch = async (req, res) => {
    try {
        const { department, branch } = req.query;
        let queryArgs = {};
        
        if (department && department !== 'All' && department !== 'undefined') queryArgs.department = department;
        if (branch && branch !== 'All' && branch !== 'undefined') queryArgs.branch = branch;

        const sems = await Subject.distinct("semester", queryArgs);
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
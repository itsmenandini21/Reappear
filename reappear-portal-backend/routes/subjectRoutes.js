import express from 'express';

const router = express.Router();
import { 
    addSubject, 
    updateSubject, 
    getAllSubjects, 
    deleteSubject, 
    getSubjectsBySemestersAndDept, 
    getSubjectsByDept,
    getUniqueDepartments,
    getBranchesByDepartment,
    getSemestersByDeptAndBranch
} from '../controllers/subjectController.js';

// When the frontend hits GET /api/subjects, run this function

router.get("/departments", getUniqueDepartments);
router.get("/branches", getBranchesByDepartment);
router.get("/semesters/distinct", getSemestersByDeptAndBranch);

router.get("/sem",getSubjectsBySemestersAndDept);
router.get("/dept",getSubjectsByDept);
router.put("/update/:id",updateSubject);
router.delete("/delete/:id",deleteSubject);
router.post("/add",addSubject);
router.get("/",getAllSubjects);

export default router;

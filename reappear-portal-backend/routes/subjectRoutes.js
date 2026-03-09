import express from 'express';

const router = express.Router();
import { addSubject,updateSubject,getAllSubjects,deleteSubject,getSubjectsBySemestersAndDept,getSubjectsByDept} from '../controllers/subjectController.js';

// When the frontend hits GET /api/subjects, run this function

router.get("/sem",getSubjectsBySemestersAndDept);
router.get("/dept",getSubjectsByDept);
router.put("/update/:id",updateSubject);
router.delete("/delete/:id",deleteSubject);
router.post("/add",addSubject);
router.get("/",getAllSubjects);

export default router;

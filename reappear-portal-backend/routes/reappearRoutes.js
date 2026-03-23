<<<<<<< HEAD
import { getMyReappears,addReappear,checkExistingBacklogs, getEligibleStudentsForResults } from "../controllers/reappearControllers.js";
=======
import { getMyReappears,addReappear,addBulkReappears,updateReappearStatus,checkExistingBacklogs, getEligibleStudentsForResults } from "../controllers/reappearControllers.js";
>>>>>>> ab21fdc0283ea295c996207406e098063ed32eb3
import { protect, admin } from "../middleware/authMiddleware.js";
import express from "express"
const router=express.Router();
router.get("/my-reappears",protect,getMyReappears);
// Admin Routes: Allows Admin to add new backlogs or change status to 'cleared'
router.post('/add', addReappear);
router.post('/add-bulk', addBulkReappears);
router.get('/check/:rollNumber', checkExistingBacklogs);
router.get('/admin/eligible-students', getEligibleStudentsForResults);
export default router;
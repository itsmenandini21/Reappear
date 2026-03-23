
import { getMyReappears,addReappear,addBulkReappears,checkExistingBacklogs, getEligibleStudentsForResults } from "../controllers/reappearControllers.js";
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

import { getMyReappears,addReappear,addBulkReappears,checkExistingBacklogs, getEligibleStudentsForResults } from "../controllers/reappearControllers.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import express from "express"
const router=express.Router();
router.get("/my-reappears",protect,getMyReappears);
// Admin Routes: Allows Admin to add new backlogs or change status to 'cleared'
router.post('/add', protect, admin, addReappear);
router.post('/add-bulk', protect, admin, addBulkReappears);
router.get('/check/:rollNumber', protect, admin, checkExistingBacklogs);
router.get('/admin/eligible-students', protect, admin, getEligibleStudentsForResults);
export default router;
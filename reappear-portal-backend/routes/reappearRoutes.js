import { getMyReappears,addReappear,updateReappearStatus,checkExistingBacklogs } from "../controllers/reappearControllers.js";
import { protect } from "../middleware/authMiddleware.js";
import express from "express"
const router=express.Router();
router.get("/my-reappears",protect,getMyReappears);
// Admin Routes: Allows Admin to add new backlogs or change status to 'cleared'
router.post('/add', addReappear);
router.put('/update/:id', updateReappearStatus);
router.get('/check/:rollNumber', checkExistingBacklogs);
export default router;
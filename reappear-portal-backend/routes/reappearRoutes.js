import { getMyReappears } from "../controllers/reappearControllers.js";

import express from "express"
const router=express.Router();
router.get("/my-reappear",getMyReappears);
export default router;
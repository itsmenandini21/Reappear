import express from "express";
import { loginUser, googleLogin, sendOtp, verifyOtpAndRegister, resendOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;
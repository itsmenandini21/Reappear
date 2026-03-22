import express from "express";
import { loginUser, googleLogin, sendOtp, verifyOtpAndRegister, resendOtp, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

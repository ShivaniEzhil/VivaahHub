import express from "express"
import {
  signIn,
  verifySignInOtp,
  signUp,
  verifySignUpOtp,
  registerVendor,
  verifyVendorOtp,
} from "../controllers/userController.js"
import { normalizeVendorRequest } from "../middleware/vendorNormalizer.js"
import { verifyToken, userCheck } from "../middleware/auth.js"
import { logout } from "../controllers/authController.js"
import { authLimiter, otpRequestLimiter, otpVerifyLimiter } from "../middleware/rateLimiters.js"
import User from "../models/User.js"

const router = express.Router()

router.post("/sign-in", otpRequestLimiter, signIn)
router.post("/verify-sign-in-otp", otpVerifyLimiter, verifySignInOtp)
router.post("/sign-up", otpRequestLimiter, signUp)
router.post("/verify-sign-up-otp", otpVerifyLimiter, verifySignUpOtp)
router.post("/register-vendor", otpRequestLimiter, normalizeVendorRequest, registerVendor)
router.post("/verify-vendor-otp", otpVerifyLimiter, normalizeVendorRequest, verifyVendorOtp)
// Example protected route
router.get("/dashboard", verifyToken, userCheck, (req, res) => {
  res.status(200).json({ message: "Welcome to User Dashboard", user: req.user })
})
router.get("/check-auth", verifyToken, (req, res) => {
  try {
    // Find the user to get complete user data
    User.findById(req.user.id)
      .select("-password")
      .then((userData) => {
        if (!userData) {
          return res.status(404).json({
            message: "User not found",
            authenticated: false
          });
        }
        res.status(200).json({
          message: "Authenticated",
          user: { ...userData.toObject(), role: req.user.role },
        })
      })
      .catch((err) => {
        console.error("User fetch error:", err)
        res.status(200).json({
          message: "Authenticated with limited data",
          user: req.user,
        })
      })
  } catch (error) {
    console.error("Auth check error:", error)
    res.status(401).json({ message: "Authentication failed" })
  }
})
router.post("/logout", logout)

export default router


import mongoose from "mongoose"

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: [true, "Phone number is required"], index: true },
    otpCode: {
      type: String,
      required: [true, "OTP code is required"],
      match: [/^\d{6}$/, "OTP must be a 6-digit code"],
    },
    role: { type: String, enum: ["user", "vendor", "admin"], required: [true, "Role is required"] },
    expiresAt: { type: Date, required: [true, "Expiration time is required"], index: { expireAfterSeconds: 0 } },
    requestCount: { type: Number, default: 0 },
    lastRequestTime: { type: Date, default: Date.now },
    attemptCount: { type: Number, default: 0 },
    /** URL of an uploaded asset that belongs to this signup attempt (e.g. vendor brand icon) */
    pendingBrandIcon: { type: String },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

otpSchema.index({ phone: 1, role: 1 }, { unique: true })

export default mongoose.model("OTP", otpSchema)


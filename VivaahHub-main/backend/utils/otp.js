import { randomInt } from "crypto";
import OTP from "../models/OTP.js";

/** Cryptographically secure 6-digit OTP */
export const generateOtp = () => randomInt(100000, 1000000).toString();

/** Standard 10-minute expiry timestamp */
export const otpExpiry = (minutes = 10) => new Date(Date.now() + minutes * 60 * 1000);

/** Maximum number of failed verification attempts before the OTP is rejected */
export const MAX_OTP_ATTEMPTS = 5;

/**
 * Look up an OTP record and enforce expiry, single-use, and brute-force protection.
 *
 * @returns {{ record: OtpDoc } | { error: { status: number, message: string } }}
 */
export const findAndValidateOtp = async ({ phone, role, otp }) => {
  if (!phone || !otp) {
    return { error: { status: 400, message: "Phone and OTP are required" } };
  }

  const record = await OTP.findOne({ phone, role });
  if (!record) {
    return { error: { status: 400, message: "Invalid or expired OTP" } };
  }

  if (new Date() > record.expiresAt) {
    await OTP.deleteOne({ _id: record._id });
    return { error: { status: 400, message: "OTP has expired. Please request a new one." } };
  }

  if (record.verified) {
    return { error: { status: 400, message: "OTP has already been used" } };
  }

  if (record.attemptCount >= MAX_OTP_ATTEMPTS) {
    return {
      error: { status: 429, message: "Too many incorrect attempts. Please request a new OTP." },
    };
  }

  if (record.otpCode !== String(otp)) {
    record.attemptCount += 1;
    await record.save();
    const remaining = Math.max(0, MAX_OTP_ATTEMPTS - record.attemptCount);
    const suffix = remaining === 1 ? "" : "s";
    return {
      error: {
        status: 400,
        message: remaining === 0
          ? "Invalid OTP. Please request a new one."
          : `Invalid OTP. ${remaining} attempt${suffix} remaining.`,
      },
    };
  }

  return { record };
};

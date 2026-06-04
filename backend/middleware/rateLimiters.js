import rateLimit from "express-rate-limit";
import { NODE_ENV } from "../config/env.js";

const isDev = NODE_ENV === "development";

const baseJson = (message) => (req, res /* next, options */) =>
  res.status(429).json({
    message,
    retryAfter: res.getHeader("Retry-After"),
  });

/** Global limit — generous, protects against runaway clients */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: baseJson("Too many requests. Please try again later."),
});

/** Auth limit — login & password reset endpoints */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: baseJson("Too many authentication attempts. Try again in 15 minutes."),
});

/** OTP request limit — keyed by IP; phone-level limit handled in controllers */
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 50 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: baseJson("Too many OTP requests from this IP. Try again in an hour."),
});

/** OTP verify limit — defense in depth alongside per-OTP attempt counter */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: baseJson("Too many OTP verification attempts. Try again later."),
});

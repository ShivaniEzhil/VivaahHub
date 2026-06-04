import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const NODE_ENV = process.env.NODE_ENV || "development";
const isProd = NODE_ENV === "production";

const DEV_JWT_SECRET = "vivaahhub-local-dev-secret";

/** Defaults let you run locally without creating a .env file */
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vivaahhub";
/** 5001 avoids macOS AirPlay using port 5000 */
export const PORT = Number(process.env.PORT) || 5001;
export const JWT_SECRET = process.env.JWT_SECRET || (isProd ? "" : DEV_JWT_SECRET);
export const TWILIO_PHONE = process.env.TWILIO_PHONE || "";
export const TWILIO_SID = process.env.TWILIO_SID || "";
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || "";
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";

const errors = [];
const warnings = [];

if (!process.env.MONGO_URI) {
  (isProd ? errors : warnings).push("MONGO_URI is not set (using local default)");
}
if (!process.env.JWT_SECRET) {
  if (isProd) {
    errors.push("JWT_SECRET is required in production");
  } else {
    warnings.push("JWT_SECRET is not set — using insecure dev default");
  }
} else if (JWT_SECRET === DEV_JWT_SECRET && isProd) {
  errors.push("JWT_SECRET cannot be the dev default in production");
} else if (JWT_SECRET.length < 32 && isProd) {
  errors.push("JWT_SECRET must be at least 32 characters in production");
}

if (isProd) {
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE) {
    warnings.push("Twilio credentials missing — SMS OTP will fail in production");
  }
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    warnings.push("Cloudinary credentials missing — uploads will fall back to local disk");
  }
}

if (warnings.length) {
  for (const w of warnings) console.warn(`[env] WARNING: ${w}`);
}

if (errors.length) {
  for (const e of errors) console.error(`[env] FATAL: ${e}`);
  console.error("[env] Aborting startup. Fix the above and restart.");
  process.exit(1);
}

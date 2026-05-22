import dotenv from "dotenv";

dotenv.config();

/** Defaults let you run locally without creating a .env file */
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vivaahhub";
/** 5001 avoids macOS AirPlay using port 5000 */
export const PORT = Number(process.env.PORT) || 5001;
export const JWT_SECRET = process.env.JWT_SECRET || "vivaahhub-local-dev-secret";
export const TWILIO_PHONE = process.env.TWILIO_PHONE || "";
export const TWILIO_SID = process.env.TWILIO_SID || "";
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const EMAIL_USERNAME = process.env.EMAIL_USERNAME || "";
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";

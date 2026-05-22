import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "./env.js";

const connectOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

const connectDB = async () => {
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log("MongoDB already connected");
        return;
      }

      await mongoose.connect(MONGO_URI, connectOptions);
      console.log("MongoDB connected");

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected — queries may fail until restart");
      });

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err.message);
      });

      return;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed:`, error.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }

  if (MONGO_URI.includes("mongodb.net")) {
    console.error("\nAtlas checklist:");
    console.error("  1. Atlas → Network Access → Add IP (0.0.0.0/0 for dev)");
    console.error("  2. Atlas → Database Access → confirm user/password");
    console.error("  3. Copy a fresh URI from Connect → Drivers");
    console.error("  4. URL-encode special characters in the password");
    if (NODE_ENV === "development") {
      console.error("\n  Or use local MongoDB in .env:");
      console.error("  MONGO_URI=mongodb://127.0.0.1:27017/vivaahhub\n");
    }
  }

  console.error(lastError?.message || lastError);
  process.exit(1);
};

export default connectDB;

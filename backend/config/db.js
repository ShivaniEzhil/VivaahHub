import mongoose from "mongoose";
import { MONGO_URI, NODE_ENV } from "./env.js";

const isAtlas = MONGO_URI.includes("mongodb.net") || MONGO_URI.startsWith("mongodb+srv://");

const connectOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  family: 4,
};

let listenersAttached = false;
let lastState = null;

const attachListenersOnce = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("disconnected", () => {
    if (lastState !== "disconnected") {
      console.warn("MongoDB disconnected — mongoose will auto-retry");
      lastState = "disconnected";
    }
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
    lastState = "connected";
  });

  mongoose.connection.on("connected", () => {
    if (lastState !== "connected") {
      lastState = "connected";
    }
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
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
      console.log(`MongoDB connected (${isAtlas ? "Atlas" : "local"})`);
      lastState = "connected";
      attachListenersOnce();
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

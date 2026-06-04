import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import { PORT, NODE_ENV, FRONTEND_URL } from "./config/env.js";
import connectDB from "./config/db.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import vendorRoutes from "./routes/vendor.js";
import dashboardRoutes from "./routes/dashboard.js";
import vendorDashboardRoutes from "./routes/vendorDashboard.js";
import publicRoutes from "./routes/public.js";
import cron from "node-cron";
import Booking from "./models/Booking.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

async function startServer() {
  try {
    await connectDB();

    const app = express();

    app.set("trust proxy", 1);

    app.use(helmet());
    app.use(globalLimiter);
    app.use(cors({ origin: FRONTEND_URL, credentials: true }));
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true, limit: "1mb" }));
    app.use(cookieParser());
    app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true }));

    // Ensure uploads directory exists
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, "uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("Created uploads directory:", uploadsDir);
    }

    app.use("/users", userRoutes);
    app.use("/admins", adminRoutes);
    app.use("/auth", authRoutes);
    app.use("/vendor", vendorRoutes);
    app.use("/dashboard", dashboardRoutes);
    app.use("/vendor/dashboard", vendorDashboardRoutes);
    app.use("/api/public", publicRoutes);
    app.use("/uploads", express.static(uploadsDir));

    cron.schedule("0 0 * * *", async () => {
      try {
        const now = new Date();
        console.log(`[CRON] Running booking auto-completion job at ${now.toISOString()}`);

        const result = await Booking.updateMany(
          { status: "confirmed", event_date: { $lt: now } },
          { $set: { status: "completed", completed_at: now, reviewAllowed: true } }
        );

        console.log(`[CRON] Auto-completed ${result.modifiedCount} bookings`);
      } catch (error) {
        console.error("[CRON] Error in auto-completion job:", error);
      }
    });

    app.use((err, req, res, next) => {
      console.error("Server error:", err.stack);
      res.status(500).json({
        message: "Internal server error",
        error: NODE_ENV === "development" ? err.message : undefined,
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
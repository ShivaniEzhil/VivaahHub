/**
 * Create or update an admin account.
 *
 * Usage (interactive — values prompted from env or args):
 *   npm run seed:admin -- --phone=+919876543210 --username=admin --password='Strong#1234'
 *
 * Or via env vars:
 *   ADMIN_PHONE=+919876543210 ADMIN_USERNAME=admin ADMIN_PASSWORD='Strong#1234' npm run seed:admin
 *
 * Optional role (default superadmin): --role=moderator
 *
 * Notes:
 *   - Phone must be +91 followed by a 10-digit mobile starting with 6-9
 *   - Password is bcrypt-hashed before storage (the User-facing Admin model has no pre-save hook)
 *   - If an admin with the same phone OR username already exists, the password/role are updated
 */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MONGO_URI } from "../config/env.js";
import { Admin } from "../models/Admin.js";

const parseArgs = () => {
  const out = {};
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith("--")) continue;
    const [k, ...rest] = arg.slice(2).split("=");
    out[k] = rest.join("=");
  }
  return out;
};

const args = parseArgs();

const phone = args.phone || process.env.ADMIN_PHONE;
const username = args.username || process.env.ADMIN_USERNAME;
const password = args.password || process.env.ADMIN_PASSWORD;
const role = args.role || process.env.ADMIN_ROLE || "superadmin";

const fail = (msg) => {
  console.error(`\n[seed:admin] ERROR: ${msg}\n`);
  console.error("Example:");
  console.error("  npm run seed:admin -- --phone=+919876543210 --username=admin --password='Strong#1234'\n");
  process.exit(1);
};

if (!phone) fail("--phone (or ADMIN_PHONE env) is required");
if (!username) fail("--username (or ADMIN_USERNAME env) is required");
if (!password) fail("--password (or ADMIN_PASSWORD env) is required");
if (!/^\+91[6-9]\d{9}$/.test(phone)) fail(`phone must match +91[6-9]\\d{9}, got "${phone}"`);
if (password.length < 8) fail("password must be at least 8 characters");
if (!["superadmin", "moderator"].includes(role)) fail(`role must be 'superadmin' or 'moderator', got "${role}"`);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("[seed:admin] Connected to MongoDB");

  const hashed = await bcrypt.hash(password, 12);

  const existing = await Admin.findOne({ $or: [{ phone }, { username }] });

  if (existing) {
    existing.phone = phone;
    existing.username = username;
    existing.password = hashed;
    existing.role = role;
    await existing.save();
    console.log(`[seed:admin] Updated existing admin "${username}" (${phone}) as ${role}`);
  } else {
    await Admin.create({ phone, username, password: hashed, role });
    console.log(`[seed:admin] Created admin "${username}" (${phone}) as ${role}`);
  }

  await mongoose.disconnect();
  console.log("[seed:admin] Done. You can now sign in at /admin/login");
}

run().catch((err) => {
  console.error("[seed:admin] Failed:", err);
  process.exit(1);
});

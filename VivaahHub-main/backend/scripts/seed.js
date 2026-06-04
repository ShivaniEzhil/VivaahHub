/**
 * Seed sample published services for local development.
 * Run: npm run seed  (from backend folder)
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGO_URI } from "../config/env.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

dotenv.config();

const baseService = {
  photos: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=400"],
  description: "Premium wedding service for your special day.",
  pricing_packages: [{ name: "Standard", price: 25000, inclusions: "Full package" }],
  availability: {
    working_hours: "9 AM - 6 PM",
    working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  price_range: "10000-50000",
  details: { cancellation_policy: "Partially Refundable" },
  status: "published",
};

const sampleServices = [
  { ...baseService, category: "Photographers", name: "Royal Lens Studio", city: "Mumbai", discount: 10 },
  { ...baseService, category: "Wedding Venues", name: "Grand Palace Banquet", city: "Delhi" },
  { ...baseService, category: "Bridal Makeup", name: "Glam by Priya", city: "Bangalore", discount: 15 },
  { ...baseService, category: "Henna Artists", name: "Mehndi Magic", city: "Jaipur" },
  { ...baseService, category: "Car Rental", name: "Elite Wedding Cars", city: "Chennai" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  let vendor = await User.findOne({ role: "vendor" });
  if (!vendor) {
    vendor = await User.create({
      phone: "+919876543210",
      username: "user919876543210",
      full_name: "Demo Vendor",
      role: "vendor",
      password: "demovendor123",
      vendorDetails: {
        category: "Photographers",
        brand_name: "Demo Vendor Co",
      },
    });
    console.log("Created demo vendor");
  }

  await Service.deleteMany({ name: { $in: sampleServices.map((s) => s.name) } });

  for (const s of sampleServices) {
    await Service.create({ ...s, vendor_id: vendor._id });
  }

  const published = await Service.countDocuments({ status: "published" });
  console.log(`Seeded ${sampleServices.length} services (${published} published total)`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

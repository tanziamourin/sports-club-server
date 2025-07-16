import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import courtRoutes from "./routes/courts.js";
import bookingRoutes from "./routes/bookings.js";
import memberRoutes from "./routes/members.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/adminRoutes.js";

import couponRoutes from "./routes/couponRoutes.js";
import confirmedBookingRoutes from "./routes/confirmedBookings.js";

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Start server after DB connects
const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.use("/users", userRoutes);
    app.use("/courts", courtRoutes);

    app.use("/confirmed-bookings", confirmedBookingRoutes);
    app.use("/bookings", bookingRoutes);
    app.use("/members", memberRoutes);
    app.use("/announcements", announcementRoutes);
    app.use("/payments", paymentRoutes);
    app.use("/admin", adminRoutes);

    app.use("/coupons", couponRoutes);

    app.get("/", (req, res) => {
      res.send("SCMS Server is running...");
    });

    app.listen(port, () => {
      console.log(`✅ Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
  });

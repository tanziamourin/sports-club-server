// routes/bookings.js
import express from "express";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ✅ Create a booking
router.post("/", async (req, res) => {
  try {
    const booking = req.body;
    const db = getDB();
    const result = await db.collection("bookings").insertOne(booking);
    res.send(result);
  } catch (err) {
    console.error("❌ Failed to create booking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// ✅ Get user's pending bookings
router.get("/pending/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const db = getDB();
    const pending = await db
      .collection("bookings")
      .find({ userEmail: email, status: "pending" }) // changed to userEmail
      .toArray();
    res.json(pending);
  } catch (err) {
    console.error("❌ Failed to fetch pending bookings:", err);
    res.status(500).json({ error: "Failed to fetch pending bookings" });
  }
});

// ✅ Get user's approved bookings
router.get("/approved/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const db = getDB();
    const approved = await db
      .collection("bookings")
      .find({ userEmail: email, status: "approved" }) // changed to userEmail
      .toArray();
    res.json(approved);
  } catch (err) {
    console.error("❌ Failed to fetch approved bookings:", err);
    res.status(500).json({ error: "Failed to fetch approved bookings" });
  }
});

// ✅ Admin: Get all pending bookings (no email required)
router.get("/pending", async (req, res) => {
  try {
    const db = getDB();
    const pending = await db
      .collection("bookings")
      .find({ status: "pending" })
      .toArray();
    res.json(pending);
  } catch (err) {
    console.error("❌ Failed to fetch all pending bookings:", err);
    res.status(500).json({ error: "Failed to fetch pending bookings" });
  }
});

// ✅ Get single booking by ID
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const db = getDB();
    const booking = await db
      .collection("bookings")
      .findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (err) {
    console.error("❌ Failed to fetch booking:", err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// ✅ Cancel booking
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const db = getDB();
    const result = await db
      .collection("bookings")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.json({ message: "Booking cancelled successfully" });
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (err) {
    console.error("❌ Failed to cancel booking:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;

import express from "express";
import { getDB } from "../config/db.js";

const router = express.Router();

// ✅ GET: all confirmed bookings (payment done)
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const confirmed = await db
      .collection("payments")
      .find({})
      .sort({ date: -1 })
      .toArray();

    res.json(confirmed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch confirmed bookings" });
  }
});

export default router;

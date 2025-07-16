import express from "express";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ✅ Get all coupons
router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const coupons = await db.collection("coupons").find().toArray();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// ✅ Get single coupon by code (for applying)
router.get("/apply/:code", async (req, res) => {
  try {
    const db = await getDB();
    const coupon = await db
      .collection("coupons")
      .findOne({ code: req.params.code });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ error: "Failed to get coupon" });
  }
});

// ✅ Add new coupon
router.post("/", async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection("coupons").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add coupon" });
  }
});

// ✅ Update coupon
router.patch("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const result = await db
      .collection("coupons")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// ✅ Delete coupon
router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const result = await db
      .collection("coupons")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

export default router;

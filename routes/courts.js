// routes/courts.js
import express from 'express';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// ✅ Paginated courts for frontend
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const db = await getDB();
    const courts = await db.collection("courts").find().skip(skip).limit(limit).toArray();
    const total = await db.collection("courts").countDocuments();

    res.json({ courts, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch paginated courts" });
  }
});

// ✅ Full court list (used by ManageCourts, no pagination)
router.get("/all", async (req, res) => {
  try {
    const db = await getDB();
    const courts = await db.collection("courts").find().toArray();
    res.json(courts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all courts" });
  }
});

// ✅ Add court
router.post("/", async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection("courts").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add court" });
  }
});

// ✅ Delete court
router.delete("/:id", async (req, res) => {
  const db = await getDB();
  const result = await db.collection("courts").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

// ✅ Update court
router.patch("/:id", async (req, res) => {
  const db = await getDB();
  const result = await db.collection("courts").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.json(result);
});

// ✅ Update court status
router.patch("/:id/status", async (req, res) => {
  const db = await getDB();
  const { status } = req.body;
  const result = await db.collection("courts").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status } }
  );
  res.json(result);
});

export default router;

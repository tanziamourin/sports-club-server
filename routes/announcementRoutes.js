import express from "express";
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ✅ Get all announcements
router.get("/", async (req, res) => {
  const db = await getDB();
  const data = await db.collection("announcements").find().toArray();
  res.json(data);
});

// ✅ Add announcement
router.post("/", async (req, res) => {
  const db = await getDB();
  const result = await db.collection("announcements").insertOne(req.body);
  res.status(201).json(result);
});

// ✅ Update announcement
router.patch("/:id", async (req, res) => {
  const db = await getDB();
  const result = await db.collection("announcements").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.json(result);
});

// ✅ Delete announcement
router.delete("/:id", async (req, res) => {
  const db = await getDB();
  const result = await db.collection("announcements").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

export default router;

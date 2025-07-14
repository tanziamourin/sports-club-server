import express from "express";
import { connectDB } from "../config/db.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// GET all courts
router.get("/", async (req, res) => {
  const db = await connectDB();
  const courts = await db.collection("courts").find().toArray();
  res.json(courts);
});

// POST add court
router.post("/", async (req, res) => {
  const db = await connectDB();
  const court = req.body;
  const result = await db.collection("courts").insertOne(court);
  res.json(result);
});

// DELETE court
router.delete("/:id", async (req, res) => {
  const db = await connectDB();
  const result = await db.collection("courts").deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

// PATCH court
router.patch("/:id", async (req, res) => {
  const db = await connectDB();
  const updatedCourt = req.body;
  const result = await db.collection("courts").updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: updatedCourt }
  );
  res.json(result);
});

export default router;

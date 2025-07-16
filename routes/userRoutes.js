import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

const router = express.Router();

// POST /users - Create new user

router.post("/", async (req, res) => {
  try {
    const { name, email, image } = req.body;
    const db = getDB();

    const existing = await db.collection("users").findOne({ email: req.params.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = {
      name,
      email,
      image,
      role: "user",
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /users - All users
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /users/:id/role - Update user role
router.patch("/:id/role", async (req, res) => {
  try {
    const db = getDB();
    const { role } = req.body;
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { role } });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// DELETE /users/:id - Delete user
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET /users/role/:email - Get role by email
// GET /users/role/:email - Get role by email
router.get("/role/:email", async (req, res) => {
  try {
    const db = await getDB(); // ✅ await যোগ করো
    const user = await db
      .collection("users")
      .findOne({ email: req.params.email });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Failed to get user role" });
  }
});

// GET /users/admin/:email - Check admin
router.get("/admin/:email", async (req, res) => {
  try {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ email: req.params.email });

    res.json({ admin: user?.role === "admin" });
  } catch (err) {
    res.status(500).json({ error: "Failed to check admin" });
  }
});

export default router;

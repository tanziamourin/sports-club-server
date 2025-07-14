import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// 1. Dashboard Stats
export const getAdminStats = async (req, res) => {
  try {
    const db = getDB();
    const totalCourts = await db.collection("courts").estimatedDocumentCount();
    const totalUsers = await db.collection("users").estimatedDocumentCount();
    const totalMembers = await db.collection("users").countDocuments({ role: "member" });

    res.json({ totalCourts, totalUsers, totalMembers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// 2. All Users
export const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// 3. All Members
export const getAllMembers = async (req, res) => {
  try {
    const db = getDB();
    const members = await db.collection("users").find({ role: "member" }).toArray();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
};

// 4. Delete Member
export const deleteMember = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Member deleted", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete member" });
  }
};

// 5. Get Confirmed Bookings
export const getConfirmedBookings = async (req, res) => {
  try {
    const db = getDB();
    const confirmed = await db.collection("bookings").find({ status: "confirmed" }).toArray();
    res.json(confirmed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    // Step 1: Approve the booking
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved" } }
    );

    // Step 2: Get the approved booking
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });

    // Step 3: Promote user to member using `userEmail`
    if (booking?.userEmail) {
      const user = await db.collection("users").findOne({ email: booking.userEmail });

      if (user && user.role !== "member") {
        await db.collection("users").updateOne(
          { email: booking.userEmail },
          { $set: { role: "member", memberSince: new Date() } }
        );
        console.log("✅ User promoted to member:", booking.userEmail);
      }
    }

    res.json({ message: "Booking approved & user promoted (if needed)" });
  } catch (err) {
    console.error("❌ Approve failed:", err);
    res.status(500).json({ error: "Approve failed" });
  }
};

// 7. Reject Booking
export const rejectBooking = async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;
    const result = await db.collection("bookings").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Booking rejected", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject booking" });
  }
};



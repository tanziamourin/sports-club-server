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


// 8. Create Membership Plan
export const createMembershipPlan = async (req, res) => {
  try {
    const db = getDB();
    const plan = req.body;
    const result = await db.collection("membershipPlans").insertOne(plan);
    res.status(201).json({ message: "Plan created", plan: { ...plan, _id: result.insertedId } });
  } catch (err) {
    res.status(500).json({ error: "Failed to create plan" });
  }
};

// 9. Get All Membership Plans
export const getAllMembershipPlans = async (req, res) => {
  try {
    const db = getDB();
    const plans = await db.collection("membershipPlans").find().toArray();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

// 10. Update Membership Plan
export const updateMembershipPlan = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const plan = req.body;
    const result = await db.collection("membershipPlans").updateOne(
      { _id: new ObjectId(id) },
      { $set: plan }
    );
    res.json({ message: "Plan updated", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update plan" });
  }
};

// 11. Delete Membership Plan
export const deleteMembershipPlan = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = await db.collection("membershipPlans").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Plan deleted", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete plan" });
  }
};

// 12. Toggle Membership Plan Status
export const toggleMembershipPlanStatus = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { active } = req.body;

    const result = await db.collection("membershipPlans").updateOne(
      { _id: new ObjectId(id) },
      { $set: { active } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Plan not found or status unchanged" });
    }

    res.json({ message: `Plan ${active ? "activated" : "deactivated"}`, result });
  } catch (err) {
    console.error("❌ Toggle plan status failed:", err);
    res.status(500).json({ error: "Failed to toggle plan status" });
  }
};

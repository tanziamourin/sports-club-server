import express from "express";
import { getDB } from "../config/db.js";
import stripe from "../config/stripe.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// ✅ Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount = Math.round(price * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("PaymentIntent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Save Payment Info & Update Booking
router.post("/", async (req, res) => {
  const payment = req.body;

  try {
    const db = await getDB();

    await db.collection("payments").insertOne(payment);
    // 3. Update booking status → confirmed
    await db
      .collection("bookings")
      .updateOne(
        { _id: new ObjectId(payment.bookingId) },
        { $set: { status: "confirmed" } }
      );

    res.json({ message: "Payment saved and booking confirmed" });
  } catch (err) {
    console.error("Payment Save Error:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

// ✅ Get Confirmed Bookings
router.get("/confirmed/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const db = await getDB();
    const confirmed = await db
      .collection("bookings")
      .find({
        userEmail: email,
        status: "confirmed",
      })
      .toArray();
    res.json(confirmed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch confirmed bookings" });
  }
});

// ✅ Get Payment History
router.get("/history/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const db = await getDB();
    const payments = await db
      .collection("payments")
      .find({ userEmail: email })
      .sort({ date: -1 })
      .toArray();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});



// ✅ Create Membership PaymentIntent
router.post("/create-membership-intent", async (req, res) => {
  const { price, planId, userId } = req.body;
  const amount = Math.round(price * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { planId, userId },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe PaymentIntent error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Process Membership Payment & Activate Membership
router.post("/process", async (req, res) => {
  const { paymentIntentId, planId, userId, amount } = req.body;

  try {
    const db = await getDB();

    // 1️⃣ Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: "Payment not succeeded" });
    }

    // 2️⃣ Save payment record
    const paymentData = {
      userId: new ObjectId(userId),
      planId: new ObjectId(planId),
      amount,
      paymentIntentId,
      status: "completed",
      paymentMethod: "card",
      date: new Date(),
    };
    const paymentResult = await db.collection("membershipPayments").insertOne(paymentData);
    console.log("Payment saved:", paymentResult.insertedId);

    // 3️⃣ Activate membership
    const membershipData = {
      userId: new ObjectId(userId),
      planId: new ObjectId(planId),
      startDate: new Date(),
      endDate: calculateEndDate(planId), // Plan duration logic
      status: "active",
      paymentId: paymentResult.insertedId,
    };
    const membershipResult = await db.collection("memberships").updateOne(
      { userId: new ObjectId(userId) },
      { $set: membershipData },
      { upsert: true }
    );
    console.log("Membership activated:", membershipResult.modifiedCount);

    // 4️⃣ Update user role → member
    const roleUpdate = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: "member" } }
    );
    console.log("Role updated:", roleUpdate.modifiedCount);

    res.json({ success: true, message: "Payment processed, membership activated, role updated" });
  } catch (err) {
    console.error("Membership Payment Error:", err);
    res.status(500).json({ error: "Membership activation failed" });
  }
});

// Helper function for membership end date
function calculateEndDate(planId) {
  // Example: monthly plan → add 1 month
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
}
export default router;

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

export default router;

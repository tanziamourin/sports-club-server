import { getDB } from "../config/db.js";

export const getMemberByEmail = async (req, res) => {
  try {
    const db = getDB();
    const email = req.params.email;
    const member = await db.collection("users").findOne({ email });

    if (!member || member.role !== "member") {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({
      name: member.name,
      email: member.email,
      image: member.image,
      memberSince: member.memberSince || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch member" });
  }
};

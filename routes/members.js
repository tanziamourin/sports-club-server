import express from "express";
import { getMemberByEmail } from "../controllers/memberController.js";

const router = express.Router();

router.get("/:email", getMemberByEmail);

export default router;

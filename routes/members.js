
import express from 'express';
import { getMemberByEmail } from '../controllers/memberController.js';

const router = express.Router();

router.get('/:email', getMemberByEmail); // ✅ এখানে রুট যোগ করো

export default router;


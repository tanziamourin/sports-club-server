import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getAllMembers,
  deleteMember,
  getConfirmedBookings,
  approveBooking,
  rejectBooking
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);vvvvvv
router.get('/members', getAllMembers);
router.delete('/members/:id', deleteMember);
router.get('/bookings/confirmed', getConfirmedBookings);
router.patch('/bookings/approve/:id', approveBooking);
router.delete('/bookings/reject/:id', rejectBooking);

export default router;

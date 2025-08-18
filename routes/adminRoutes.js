import express from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllMembers,
  deleteMember,
  getConfirmedBookings,
  approveBooking,
  rejectBooking,
  createMembershipPlan,
  getAllMembershipPlans,
  updateMembershipPlan,
  deleteMembershipPlan,
  toggleMembershipPlanStatus 
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/members", getAllMembers);
router.delete("/members/:id", deleteMember);

// Bookings Routes
router.get("/bookings/confirmed", getConfirmedBookings);
router.patch("/bookings/approve/:id", approveBooking);
router.delete("/bookings/reject/:id", rejectBooking);

// Membership Plans Routes
router.post('/membership-plans', createMembershipPlan);
router.get('/membership-plans', getAllMembershipPlans);
router.put('/membership-plans/:id', updateMembershipPlan);
router.delete('/membership-plans/:id', deleteMembershipPlan);
router.patch("/membership-plans/:id/status", toggleMembershipPlanStatus); 
export default router;

import { Router } from "express";
import { createBooking, getBookings, getBookingById, updateBooking, cancelBooking, deleteBooking } from "../controllers/booking.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(createBooking));
router.get("/", asyncHandler(getBookings));
router.get("/:id", asyncHandler(getBookingById));
router.put("/:id", asyncHandler(updateBooking));
router.delete("/:id", asyncHandler(deleteBooking));
router.patch("/:id/cancel", asyncHandler(cancelBooking));
export default router;
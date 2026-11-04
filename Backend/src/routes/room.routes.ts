import { Router } from "express";
import { createRoom, getRooms, getRoomById, updateRoom, deleteRoom } from "../controllers/room.controller.js";
import { getRoomBookingsByDate } from "../controllers/booking.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/", asyncHandler(createRoom));
router.get("/", asyncHandler(getRooms));
router.get("/:id/bookings", asyncHandler(getRoomBookingsByDate));
router.get("/:id", asyncHandler(getRoomById));
router.put("/:id", asyncHandler(updateRoom));
router.delete("/:id", asyncHandler(deleteRoom));
export default router;
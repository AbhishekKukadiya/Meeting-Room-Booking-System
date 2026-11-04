import type { Request, Response } from "express";
import { and, asc, eq, gt, lt, ne, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { bookings, rooms } from "../db/schema.js";

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}
function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

async function validateBooking(input: any, excludeId?: number) {
  const roomId = Number(input.roomId);
  const attendeeCount = Number(input.attendeeCount);
  if (!Number.isInteger(roomId) || roomId <= 0) return "A valid room is required.";
  if (!input.organizerName?.trim() || !input.meetingTitle?.trim()) return "Organizer name and meeting title are required.";
  if (!validDate(input.bookingDate)) return "Date must be in YYYY-MM-DD format.";
  if (input.bookingDate < new Date().toISOString().slice(0, 10)) return "Booking date cannot be in the past.";
  if (!validTime(input.startTime) || !validTime(input.endTime)) return "Valid start and end times are required.";
  if (input.startTime >= input.endTime) return "End time must be after start time.";
  if (!Number.isInteger(attendeeCount) || attendeeCount <= 0) return "Attendee count must be a positive whole number.";

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return "Selected room does not exist.";
  if (attendeeCount > room.capacity) return `Attendees cannot exceed room capacity (${room.capacity}).`;

  const conditions = [
    eq(bookings.roomId, roomId),
    eq(bookings.bookingDate, input.bookingDate),
    eq(bookings.status, "active"),
    lt(bookings.startTime, input.endTime),
    gt(bookings.endTime, input.startTime),
  ];
  if (excludeId !== undefined) conditions.push(ne(bookings.id, excludeId));

  const conflicts = await db.select({ id: bookings.id }).from(bookings).where(and(...conditions)).limit(1);
  if (conflicts.length) return "Room is already booked during this time.";
  return null;
}

export async function createBooking(req: Request, res: Response) {
  const error = await validateBooking(req.body);
  if (error) return res.status(error.includes("already booked") ? 409 : 400).json({ message: error });

  const [booking] = await db.insert(bookings).values({
    roomId: Number(req.body.roomId),
    organizerName: req.body.organizerName.trim(),
    meetingTitle: req.body.meetingTitle.trim(),
    bookingDate: req.body.bookingDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    attendeeCount: Number(req.body.attendeeCount),
  }).returning();
  return res.status(201).json({ message: "Booking created successfully.", data: booking });
}

export async function getBookings(req: Request, res: Response) {
  const conditions = [];
  if (req.query.roomId) {
    const roomId = Number(req.query.roomId);
    if (!Number.isInteger(roomId) || roomId <= 0) return res.status(400).json({ message: "Invalid roomId filter." });
    conditions.push(eq(bookings.roomId, roomId));
  }
  if (req.query.date) {
    const date = String(req.query.date);
    if (!validDate(date)) return res.status(400).json({ message: "Date must be YYYY-MM-DD." });
    conditions.push(eq(bookings.bookingDate, date));
  }
  const rows = await db.select({
    id: bookings.id, roomId: bookings.roomId, roomName: rooms.name, roomLocation: rooms.location,
    roomCapacity: rooms.capacity, organizerName: bookings.organizerName,
    meetingTitle: bookings.meetingTitle, bookingDate: bookings.bookingDate,
    startTime: bookings.startTime, endTime: bookings.endTime,
    attendeeCount: bookings.attendeeCount, status: bookings.status,
  }).from(bookings).innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bookings.bookingDate), asc(bookings.startTime));
  return res.json({ data: rows });
}

export async function getBookingById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid booking id." });
  const [row] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!row) return res.status(404).json({ message: "Booking not found." });
  return res.json({ data: row });
}

export async function updateBooking(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid booking id." });
  const [existing] = await db.select().from(bookings).where(eq(bookings.id, id));
  if (!existing) return res.status(404).json({ message: "Booking not found." });
  if (existing.status === "cancelled") return res.status(400).json({ message: "Cancelled bookings cannot be edited." });

  const input = { ...existing, ...req.body };
  const error = await validateBooking(input, id);
  if (error) return res.status(error.includes("already booked") ? 409 : 400).json({ message: error });

  const [updated] = await db.update(bookings).set({
    roomId: Number(input.roomId), organizerName: input.organizerName.trim(),
    meetingTitle: input.meetingTitle.trim(), bookingDate: input.bookingDate,
    startTime: input.startTime, endTime: input.endTime,
    attendeeCount: Number(input.attendeeCount), updatedAt: new Date(),
  }).where(eq(bookings.id, id)).returning();
  return res.json({ message: "Booking updated successfully.", data: updated });
}

export async function cancelBooking(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid booking id." });
  const [updated] = await db.update(bookings).set({
    status: "cancelled", updatedAt: new Date(),
  }).where(eq(bookings.id, id)).returning();
  if (!updated) return res.status(404).json({ message: "Booking not found." });
  return res.json({ message: "Booking cancelled successfully.", data: updated });
}

export async function deleteBooking(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid booking id." });
  const [deleted] = await db.delete(bookings).where(eq(bookings.id, id)).returning({ id: bookings.id });
  if (!deleted) return res.status(404).json({ message: "Booking not found." });
  return res.json({ message: "Booking deleted successfully." });
}

export async function getRoomBookingsByDate(req: Request, res: Response) {
  const roomId = Number(req.params.id);
  const date = String(req.query.date || "");
  if (!Number.isInteger(roomId) || roomId <= 0) return res.status(400).json({ message: "Invalid room id." });
  if (!validDate(date)) return res.status(400).json({ message: "Provide date as YYYY-MM-DD." });
  const rows = await db.select().from(bookings).where(and(
    eq(bookings.roomId, roomId), eq(bookings.bookingDate, date), eq(bookings.status, "active")
  )).orderBy(asc(bookings.startTime));
  return res.json({ data: rows });
}
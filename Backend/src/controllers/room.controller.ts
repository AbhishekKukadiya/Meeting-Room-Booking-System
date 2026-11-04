import type { Request, Response } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/db.js";
import { rooms, bookings } from "../db/schema.js";

export async function createRoom(req: Request, res: Response) {
  const { name, location, capacity } = req.body;
  if (!name?.trim() || !location?.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    return res.status(400).json({ message: "Name, location and a positive capacity are required." });
  }
  const [room] = await db.insert(rooms).values({
    name: name.trim(), location: location.trim(), capacity: Number(capacity),
  }).returning();
  return res.status(201).json({ message: "Room created successfully.", data: room });
}

export async function getRooms(_req: Request, res: Response) {
  const data = await db.select().from(rooms).orderBy(asc(rooms.name));
  return res.json({ data });
}

export async function getRoomById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid room id." });
  const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
  if (!room) return res.status(404).json({ message: "Room not found." });
  return res.json({ data: room });
}

export async function updateRoom(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, location, capacity } = req.body;
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid room id." });
  if (!name?.trim() || !location?.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
    return res.status(400).json({ message: "Name, location and a positive capacity are required." });
  }
  const [room] = await db.update(rooms).set({
    name: name.trim(), location: location.trim(), capacity: Number(capacity), updatedAt: new Date(),
  }).where(eq(rooms.id, id)).returning();
  if (!room) return res.status(404).json({ message: "Room not found." });
  return res.json({ message: "Room updated successfully.", data: room });
}

export async function deleteRoom(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid room id." });
  const linked = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.roomId, id)).limit(1);
  if (linked.length) return res.status(409).json({ message: "This room has bookings and cannot be deleted." });
  const [deleted] = await db.delete(rooms).where(eq(rooms.id, id)).returning();
  if (!deleted) return res.status(404).json({ message: "Room not found." });
  return res.json({ message: "Room deleted successfully." });
}
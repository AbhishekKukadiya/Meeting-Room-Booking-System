import type { Request, Response } from "express";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { db } from "../db/db.js";
import { bookings, rooms } from "../db/schema.js";

export async function getDashboard(_req: Request, res: Response) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const [roomCount] = await db.select({ total: count() }).from(rooms);
  const [bookingCount] = await db.select({ total: count() }).from(bookings).where(and(
    eq(bookings.bookingDate, today), eq(bookings.status, "active")
  ));
  const todayBookings = await db.select({
    id: bookings.id, meetingTitle: bookings.meetingTitle, organizerName: bookings.organizerName,
    startTime: bookings.startTime, endTime: bookings.endTime, attendeeCount: bookings.attendeeCount,
    roomName: rooms.name, roomLocation: rooms.location,
  }).from(bookings).innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(and(eq(bookings.bookingDate, today), eq(bookings.status, "active")))
    .orderBy(bookings.startTime);

  return res.json({
    data: {
      totalRooms: Number(roomCount.total),
      todaysActiveBookings: Number(bookingCount.total),
      today,
      bookings: todayBookings,
    },
  });
}
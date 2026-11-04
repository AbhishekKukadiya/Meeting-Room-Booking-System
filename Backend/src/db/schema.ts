import {
  pgTable,
  serial,
  varchar,
  integer,
  date,
  time,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bookingStatus = pgEnum("booking_status", ["active", "cancelled"]);

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 150 }).notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "restrict" }),
  organizerName: varchar("organizer_name", { length: 100 }).notNull(),
  meetingTitle: varchar("meeting_title", { length: 150 }).notNull(),
  bookingDate: date("booking_date", { mode: "string" }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  attendeeCount: integer("attendee_count").notNull(),
  status: bookingStatus("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
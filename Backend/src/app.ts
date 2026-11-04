import express from "express";
import cors from "cors";
import "dotenv/config";
import roomRoutes from "./routes/room.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "Meeting Room Booking API is running." }));
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
# Meeting Room Booking Backend

Built with Node.js, Express, TypeScript, PostgreSQL and Drizzle ORM.

## 1. Install
```bash
npm install
```

## 2. Create PostgreSQL database
Create a database named `meeting_room_db` in pgAdmin or psql.
You can run `database/setup.sql` in that database to create tables and sample rooms.

Alternatively, use Drizzle:
```bash
npm run db:generate
npm run db:migrate
```
Do not run both database setup methods on the same empty database; choose one.

## 3. Environment
Copy `.env.example` to `.env` and set your PostgreSQL password:
```env
PORT=8000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/meeting_room_db
FRONTEND_URL=http://localhost:5173
```

## 4. Start
```bash
npm run dev
```
API base URL: `http://localhost:8000/api`

## Endpoints

### Rooms
- POST `/api/rooms`
- GET `/api/rooms`
- GET `/api/rooms/:id`
- PUT `/api/rooms/:id`
- DELETE `/api/rooms/:id`
- GET `/api/rooms/:id/bookings?date=YYYY-MM-DD`

### Bookings
- POST `/api/bookings`
- GET `/api/bookings`
- GET `/api/bookings?roomId=1&date=YYYY-MM-DD`
- GET `/api/bookings/:id`
- PUT `/api/bookings/:id`
- DELETE `/api/bookings/:id`
- PATCH `/api/bookings/:id/cancel`

### Dashboard
- GET `/api/dashboard`

## Example create room
```json
{ "name": "Training Room", "location": "Floor 2", "capacity": 10 }
```

## Example create booking
```json
{
  "roomId": 1,
  "organizerName": "Abhishek",
  "meetingTitle": "Project Discussion",
  "bookingDate": "2026-11-04",
  "startTime": "10:00",
  "endTime": "11:00",
  "attendeeCount": 6
}
```

Overlap rule: an existing active booking conflicts when its start is before the new end AND its end is after the new start. This permits back-to-back bookings.
Bookings can be made for today or a future date; past dates are rejected.

## Notes
- No authentication is implemented, as requested in the assessment.
- Room deletion is blocked if any booking references that room.
- Cancelled bookings remain in the database but do not block future bookings.
- For production-grade protection against simultaneous requests, add a PostgreSQL exclusion constraint or transaction/locking strategy for room/date/time ranges.

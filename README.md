# Meeting Room Booking System

A full-stack web application to manage meeting rooms and schedule meetings without booking conflicts.

## 🚀 Project Overview

The Meeting Room Booking System allows users to manage meeting rooms, create bookings, view scheduled meetings, edit bookings, and cancel bookings.

The system prevents double bookings and validates room capacity and meeting timings.

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- Drizzle ORM

### Database
- PostgreSQL

## ✨ Features

- Add, view, and manage meeting rooms.
- Create meeting bookings.
- Edit existing bookings.
- Cancel meeting bookings.
- Filter bookings by room and date.
- View room bookings for a selected date.
- Dashboard showing total rooms and today's active bookings.
- Prevent overlapping bookings for the same room.
- Validate meeting start and end times.
- Validate attendee count against room capacity.
- Frontend and backend validation.
- Loading, error, and empty states.

## 📂 Project Structure

```text
Meeting-Room-Booking-System/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── db/
│   │   ├── middleware/
│   │   └── app.ts
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Meeting-Room-Booking-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=8000
DATABASE_URL=your_postgresql_database_url
FRONTEND_URL=http://localhost:5173
```

Run database migrations if configured:

```bash
npm run db:generate
npm run db:migrate
```

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:8000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## 📡 API Endpoints

### Rooms

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | Get all rooms |
| POST | `/api/rooms` | Create a room |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookings` | Get bookings |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard statistics |



CREATE TYPE booking_status AS ENUM ('active', 'cancelled');

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  organizer_name VARCHAR(100) NOT NULL,
  meeting_title VARCHAR(150) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  attendee_count INTEGER NOT NULL CHECK (attendee_count > 0),
  status booking_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

CREATE INDEX bookings_room_date_idx ON bookings(room_id, booking_date);
CREATE INDEX bookings_status_idx ON bookings(status);

INSERT INTO rooms (name, location, capacity) VALUES
('Conference Room A', 'Floor 1', 12),
('Meeting Room B', 'Floor 2', 8),
('Board Room', 'Floor 3', 20);
import { useEffect, useState } from "react";
import axios from "../Utils/Axios";
import type { Room, Booking } from "../Types";
import { toast } from "react-toastify";

function isBookingCompleted(booking: Booking, currentTime: number): boolean {
  if (booking.status !== "active") {
    return false;
  }

  const endTime = new Date(`${booking.bookingDate}T${booking.endTime}`);
  return !Number.isNaN(endTime.getTime()) && endTime.getTime() <= currentTime;
}

function Bookings() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [loading, setLoading] = useState(true);

  const [roomId, setRoomId] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendeeCount, setAttendeeCount] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  // Filters
  const [filterRoom, setFilterRoom] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    getRooms();
    getBookings();

    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Get rooms for dropdown
  const getRooms = async () => {
    try {
      const response = await axios.get("/rooms");
      setRooms(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load rooms");
    }
  };

  // Get bookings with filters
  const getBookings = async () => {
    setLoading(true);

    try {
      const params: any = {};

      if (filterRoom) {
        params.roomId = filterRoom;
      }

      if (filterDate) {
        params.date = filterDate;
      }

      const response = await axios.get("/bookings", { params });

      setBookings(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const handleFilter = () => {
    getBookings();
  };

  // Clear form
  const clearForm = () => {
    setRoomId("");
    setOrganizerName("");
    setMeetingTitle("");
    setBookingDate("");
    setStartTime("");
    setEndTime("");
    setAttendeeCount("");
    setEditId(null);
  };

  // Create or Update booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !roomId ||
      !organizerName.trim() ||
      !meetingTitle.trim() ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !attendeeCount
    ) {
      toast.error("Please fill all fields");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    if (
      Number(attendeeCount) <= 0 ||
      !Number.isInteger(Number(attendeeCount))
    ) {
      toast.error("Attendees must be a positive whole number");
      return;
    }

    const selectedRoom = rooms.find((room) => room.id === Number(roomId));

    if (!selectedRoom) {
      toast.error("Please select a valid room");
      return;
    }

    if (Number(attendeeCount) > selectedRoom.capacity) {
      toast.error(`Maximum room capacity is ${selectedRoom.capacity}`);
      return;
    }

    // Prevent past dates
    const today = new Date().toLocaleDateString("en-CA");

    if (bookingDate < today) {
      toast.error("Booking date cannot be in the past");
      return;
    }

    const data = {
      roomId: Number(roomId),
      organizerName,
      meetingTitle,
      bookingDate,
      startTime,
      endTime,
      attendeeCount: Number(attendeeCount),
    };

    try {
      if (editId) {
        await axios.put(`/bookings/${editId}`, data);
        toast.success("Booking updated successfully");
      } else {
        await axios.post("/bookings", data);
        toast.success("Booking created successfully");
      }

      clearForm();
      getBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  // Edit booking
  const handleEdit = (booking: Booking) => {
    if (booking.status === "cancelled") {
      toast.error("Cancelled booking cannot be edited");
      return;
    }

    setEditId(booking.id);
    setRoomId(String(booking.roomId));
    setOrganizerName(booking.organizerName);
    setMeetingTitle(booking.meetingTitle);
    setBookingDate(booking.bookingDate);
    setStartTime(booking.startTime.slice(0, 5));
    setEndTime(booking.endTime.slice(0, 5));
    setAttendeeCount(String(booking.attendeeCount));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel booking
  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await axios.patch(`/bookings/${id}/cancel`);

      toast.success("Booking cancelled successfully");

      getBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to cancel booking");
    }
  };

  // Selected room bookings for selected date
  const getRoomBookings = async () => {
    if (!filterRoom || !filterDate) {
      toast.error("Please select room and date");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/rooms/${filterRoom}/bookings`, {
        params: {
          date: filterDate,
        },
      });

      setBookings(
        response.data.data.map((booking: any) => ({
          ...booking,
          roomName:
            rooms.find((room) => room.id === booking.roomId)?.name || "Room",
          roomLocation:
            rooms.find((room) => room.id === booking.roomId)?.location || "",
          roomCapacity:
            rooms.find((room) => room.id === booking.roomId)?.capacity || 0,
        })),
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Unable to get room bookings",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Manage Bookings</h3>

      {/* Booking Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            {editId ? "Edit Booking" : "Create New Booking"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Select Room</label>

                <select
                  className="form-select"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  <option value="">Select Room</option>

                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} - Capacity: {room.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Organizer Name</label>

                <input
                  type="text"
                  className="form-control"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Enter organizer name"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Meeting Title</label>

                <input
                  type="text"
                  className="form-control"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting title"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Booking Date</label>

                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Start Time</label>

                <input
                  type="time"
                  className="form-control"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">End Time</label>

                <input
                  type="time"
                  className="form-control"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Attendee Count</label>

                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <button className="btn btn-primary me-2" type="submit">
                {editId ? "Update Booking" : "Create Booking"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Filter Bookings</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Select Room</label>

              <select
                className="form-select"
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
              >
                <option value="">All Rooms</option>

                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Select Date</label>

              <input
                type="date"
                className="form-control"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="col-md-4 d-flex align-items-end gap-2">
              <button className="btn btn-primary" onClick={handleFilter}>
                Search
              </button>

              <button
                className="btn btn-info text-white"
                onClick={getRoomBookings}
              >
                Room Schedule
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFilterRoom("");
                  setFilterDate("");
                  setTimeout(() => getBookings(), 0);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Booking List</h5>

          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-secondary">No bookings found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Meeting</th>
                    <th>Room</th>
                    <th>Organizer</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {
                    const completed = isBookingCompleted(booking, currentTime);

                    return (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>

                        <td>{booking.meetingTitle}</td>

                        <td>{booking.roomName}</td>

                        <td>{booking.organizerName}</td>

                        <td>{booking.bookingDate}</td>

                        <td>
                          {booking.startTime.slice(0, 5)} -
                          {booking.endTime.slice(0, 5)}
                        </td>

                        <td>{booking.attendeeCount}</td>

                        <td>
                          <span
                            className={`badge ${
                              completed
                                ? "bg-primary"
                                : booking.status === "active"
                                  ? "bg-success"
                                  : "bg-secondary"
                            }`}
                          >
                            {completed ? "Completed" : booking.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2 mb-1"
                            disabled={booking.status === "cancelled"}
                            onClick={() => handleEdit(booking)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm mb-1"
                            disabled={booking.status === "cancelled"}
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bookings;
